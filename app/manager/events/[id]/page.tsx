"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, UserPlus, Sparkles, Phone, Mail, Edit, Trash2, CreditCard, Play, CheckCircle2, Check, Plus, AlertCircle, X, MoreVertical } from "lucide-react";

import {
  getEventById,
  deleteEvent,
  startEvent,
  updateEventStatus,
  type Event,
  type EventStatus,
} from "@/lib/event.api";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import EventServiceStaffingMatrix from "@/components/manager/events/EventServiceStaffingMatrix";
import EventProfitabilityCard from "@/components/manager/events/EventProfitabilityCard";
import EventStaffAttendanceCard from "@/components/manager/events/EventStaffAttendanceCard";
import EventActivityTimelineCard from "@/components/manager/events/EventActivityTimelineCard";
import EventStockTab from "@/components/manager/events/EventStockTab";
import EventClientPaymentCard from "@/components/manager/events/EventClientPaymentCard";
import EditEventModal from "@/components/manager/events/EditEventModal";
import DeleteEventModal from "@/components/manager/events/DeleteEventModal";
import { getEventStaffAttendance } from "@/lib/attendance.api";
import { getEventActivityTimeline } from "@/lib/event.api";
import ClientDocumentModal from "@/components/manager/documents/ClientDocumentModal";
import {
  type ClientDocumentData,
  defaultCompanyDetails,
} from "@/lib/document-formatter";
import { formatTime24to12 } from "@/lib/time-utils";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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

  const isEventClosed = useMemo(() => {
    const s = (event?.status || "").toUpperCase();
    return s === "COMPLETED" || s === "CANCELLED" || s === "SETTLED" || s === "REJECTED";
  }, [event?.status]);

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
  const [activitiesData, setActivitiesData] = useState<any[]>([]);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

  const fetchMonitoringData = useCallback(async () => {
    if (!token || !eventId) return;
    try {
      setMonitoringLoading(true);
      const [attendanceRes, activityRes] = await Promise.all([
        getEventStaffAttendance(token, eventId).catch(() => []),
        getEventActivityTimeline(eventId, token).catch(() => ({ success: false, data: { activities: [] } })),
      ]);
      setAttendanceTrackingData(attendanceRes);
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

  const handleStartEvent = async () => {
    if (!eventId) return;
    try {
      setActionLoading(true);
      await startEvent(eventId, token || undefined);
      setActionFeedback({
        type: "success",
        message: "Operations for this event have been started successfully!",
      });
      await fetchEvent();
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to start event. Please check required staff or timing.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: EventStatus) => {
    if (!eventId) return;
    try {
      setActionLoading(true);
      await updateEventStatus(eventId, newStatus, token || undefined);
      setActionFeedback({
        type: "success",
        message: `Event status updated to "${newStatus}"!`,
      });
      await fetchEvent();
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update event status.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // Load Event
  // ==========================================

  useEffect(() => {
    void fetchEvent();
    void fetchMonitoringData();

    // Auto-poll live staff attendance, duties & monitoring data every 4 seconds
    const interval = setInterval(() => {
      void fetchMonitoringData();
      if (token && eventId) {
        void fetchAssignments({
          event: eventId,
          page: 1,
          limit: 100,
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchEvent, fetchMonitoringData, fetchAssignments, token, eventId]);

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

    const handleRealtimeDutyUpdate = () => {
      if (token && eventId) {
        void fetchAssignments({
          event: eventId,
          page: 1,
          limit: 100,
        });
        void fetchEvent();
      }
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
    socket.on("duty:updated", handleRealtimeDutyUpdate);
    socket.on("duty:refresh", handleRealtimeDutyUpdate);
    socket.on("attendance:updated", handleRealtimeDutyUpdate);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("event:joined", onEventJoined);
      socket.off("duty:updated", handleRealtimeDutyUpdate);
      socket.off("duty:refresh", handleRealtimeDutyUpdate);
      socket.off("attendance:updated", handleRealtimeDutyUpdate);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [eventId, token, fetchAssignments, fetchEvent]);

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
          time: formatTime24to12(event.eventTime) || event.eventTime,
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
            {/* Create Estimate / Booking Button */}
           

            {/* Accept / Confirm Action if Pending */}
            {(event.status || "").toLowerCase() === "pending" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus("CONFIRMED")}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>Accept & Confirm</span>
              </button>
            )}

            {/* Start Event Trigger if Upcoming/Confirmed */}
            {!isEventClosed &&
              (event.status || "").toLowerCase() !== "ongoing" &&
              (event.status || "").toLowerCase() !== "in_progress" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleStartEvent}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition active:scale-95 disabled:opacity-50"
                  title="Start live operations for this event"
                >
                  {actionLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Play size={14} className="fill-white" />
                  )}
                  <span>Start Event</span>
                </button>
              )}

            {/* Complete Event Trigger if Live/Ongoing */}
            {((event.status || "").toLowerCase() === "ongoing" ||
              (event.status || "").toLowerCase() === "in_progress") && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus("Completed")}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-purple-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-800 transition active:scale-95 disabled:opacity-50"
                title="Mark this event operations as completed"
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>Complete Event</span>
              </button>
            )}

            {/* Mark Settled Trigger if Completed */}
            {(event.status || "").toLowerCase() === "completed" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus("Settled")}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-[#29241F] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-black transition active:scale-95 disabled:opacity-50"
                title="Mark financial settlement as closed"
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                )}
                <span>Mark Settled</span>
              </button>
            )}

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

            {/* Record Payment Trigger */}
          
            {/* 3-Dots More Options Menu for Edit & Delete */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex min-h-11 w-11 items-center justify-center rounded-2xl border border-gray-300 bg-white text-gray-700 shadow-xs hover:bg-gray-50 transition active:scale-95"
                title="More event actions"
                aria-label="More event actions"
                aria-expanded={menuOpen}
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-20 cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-30 w-44 overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setEditModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#29241f] hover:bg-[#faf7f2] transition"
                    >
                      <Edit size={14} className="text-[#9A7B4F]" />
                      <span>Edit Event</span>
                    </button>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} className="text-red-600" />
                      <span>Delete Event</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`mt-4 flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-semibold shadow-xs transition ${
              actionFeedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {actionFeedback.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-600 shrink-0" />
              )}
              <span className="truncate">{actionFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-gray-400 hover:text-gray-700 shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        )}

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
                  {event.eventType}
                </p>
              </div>

              <span className="rounded-full bg-[#F4EFE4] px-3 py-1 text-xs font-bold text-[#8C7A55]">
                {event.status}
              </span>
            </div>

            <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span className="font-bold text-[#252525]">{formatDate(event.eventDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time:</span>
                <span className="font-bold text-[#252525]">
                  {formatTime24to12(event.eventTime) || event.eventTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Guests:</span>
                <span className="font-bold text-[#252525]">{event.guests} guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Venue:</span>
                <span className="font-bold text-[#252525] truncate max-w-[150px]">{event.location}</span>
              </div>
              {/* <div className="flex justify-between border-t border-dashed border-gray-100 pt-2">
                <span className="text-gray-400">Client Payments:</span>
                <span className="font-bold text-[#252525]">
                  <span className="text-emerald-700">₹{eventPaid.toLocaleString("en-IN")}</span>
                  {" / "}
                  <span className={eventBalance > 0 ? "text-red-600" : "text-gray-500"}>
                    ₹{eventBalance.toLocaleString("en-IN")} bal
                  </span>
                </span>
              </div> */}
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
            Client Payment Details & Balance Settlement
        ====================================== */}
        <section className="mt-6" id="payments">
          <EventClientPaymentCard
            event={event}
            token={token || undefined}
            onPaymentRecorded={fetchEvent}
          />
        </section>

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
            Operational Activity Audit Log
        ====================================== */}
        {/* <section className="mt-6">
          <EventActivityTimelineCard
            activities={activitiesData}
            loading={monitoringLoading}
            onRefresh={fetchMonitoringData}
          />
        </section> */}

        {/* ======================================
            Staff Assignments
        ====================================== */}


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
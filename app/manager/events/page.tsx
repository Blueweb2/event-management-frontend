"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

import {
  getEvents,
  deleteEvent,
  startEvent,
  updateEventStatus,
  type Event,
  type EventStatus,
} from "@/lib/event.api";

import EventsHeader from "@/components/manager/events/EventsHeader";
import EventsStats from "@/components/manager/events/EventStats";
import EventFilters from "@/components/manager/events/EventFilters";
import EventSearch from "@/components/manager/events/EventSearch";
import EventList from "@/components/manager/events/EventList";
import EmptyEvents from "@/components/manager/events/EmptyEvents";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EditEventModal from "@/components/manager/events/EditEventModal";
import DeleteEventModal from "@/components/manager/events/DeleteEventModal";
import ClientDocumentModal from "@/components/manager/documents/ClientDocumentModal";
import { buildDocumentDataFromEvent } from "@/lib/document-formatter";
import { useAuth } from "@/hooks/useAuth";

function ManagerEventsContent() {
  const { token } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EventStatus | "All">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [exportingEvent, setExportingEvent] = useState<Event | null>(null);

  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEvents({
        search: search.trim() || undefined,
        status: status === "All" ? undefined : status,
        page: 1,
        limit: 100,
      });

      setEvents(response.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load events";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchEvents]);

  const handleStartEvent = async (event: Event) => {
    try {
      await startEvent(event._id, token || undefined);
      setActionFeedback({
        type: "success",
        message: `Operations for "${event.eventName}" have been started successfully!`,
      });
      await fetchEvents();
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to start event. Please check required duties or time window.",
      });
    }
  };

  const handleAcceptEvent = async (event: Event) => {
    try {
      await updateEventStatus(event._id, "CONFIRMED", token || undefined);
      setActionFeedback({
        type: "success",
        message: `Event "${event.eventName}" has been accepted and confirmed!`,
      });
      await fetchEvents();
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to accept event. Please try again.",
      });
    }
  };

  const handleEditSuccess = (updatedEvent: Event) => {
    setEvents((prev) =>
      prev.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
    );
    fetchEvents();
  };

  const handleDeleteConfirm = async (eventId: string) => {
    await deleteEvent(eventId, token || undefined);
    setEvents((prev) => prev.filter((e) => e._id !== eventId));
  };

  const totalEvents = events.length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const isCompletedEvent = (st?: string) => {
    const s = (st || "").toLowerCase();
    return (
      s === "completed" ||
      s === "settled" ||
      s === "invoiced" ||
      s === "cancelled"
    );
  };

  const isTodayDate = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return (
      !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString()
    );
  };

  const ongoingEvents = events.filter((event) => {
    const s = (event.status || "").toLowerCase();
    if (isCompletedEvent(event.status)) return false;
    return (
      (s === "ongoing" || s === "in_progress") && isTodayDate(event.eventDate)
    );
  }).length;

  const upcomingEvents = events.filter((event) => {
    const s = (event.status || "").toLowerCase();
    if (isCompletedEvent(event.status)) return false;
    if (
      (s === "ongoing" || s === "in_progress") &&
      isTodayDate(event.eventDate)
    )
      return false;
    if (!event.eventDate) return false;
    const d = new Date(event.eventDate);
    if (isNaN(d.getTime())) return false;
    const eventEnd = new Date(d);
    eventEnd.setHours(23, 59, 59, 999);
    return eventEnd.getTime() >= todayStart.getTime();
  }).length;

  const completedEvents = events.filter((event) => {
    const s = (event.status || "").toLowerCase();
    return s === "completed" || s === "settled" || s === "invoiced";
  }).length;

  return (
    <div className="w-full space-y-6">
      <div className="w-full">
        {/* Unified Header */}
        <div className="border-b border-gray-200 pb-5">
          <EventsHeader />
        </div>

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

        {/* Stats Overview */}
        <section className="mt-5 max-w-7xl">
          <EventsStats
            total={totalEvents}
            upcoming={upcomingEvents}
            ongoing={ongoingEvents}
            completed={completedEvents}
          />
        </section>

        {/* Search */}
        <section className="mt-6 max-w-7xl">
          <EventSearch value={search} onChange={setSearch} />
        </section>

        {/* Status Filters */}
        <section className="mt-4 max-w-7xl">
          <EventFilters value={status} onChange={setStatus} />
        </section>

        {/* Unified Event List */}
        <section className="mt-6 max-w-7xl">
          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <ErrorMessage message={error} />
              <button
                type="button"
                onClick={fetchEvents}
                className="mt-4 min-h-11 rounded-xl bg-[#252525] px-5 text-sm font-semibold text-white transition active:scale-[0.98]"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            <EmptyEvents />
          ) : (
            <EventList
              events={events}
              onEdit={(evt) => setEditingEvent(evt)}
              onDelete={(evt) => setDeletingEvent(evt)}
              onStart={handleStartEvent}
              onAccept={handleAcceptEvent}
              onExport={(evt) => setExportingEvent(evt)}
            />
          )}
        </section>
      </div>

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={Boolean(editingEvent)}
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Event Modal */}
      <DeleteEventModal
        isOpen={Boolean(deletingEvent)}
        event={deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Export Quotation / Invoice Modal */}
      {exportingEvent && (
        <ClientDocumentModal
          isOpen={Boolean(exportingEvent)}
          onClose={() => setExportingEvent(null)}
          data={buildDocumentDataFromEvent(exportingEvent)}
        />
      )}
    </div>
  );
}

export default function ManagerEventsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <ManagerEventsContent />
    </Suspense>
  );
}
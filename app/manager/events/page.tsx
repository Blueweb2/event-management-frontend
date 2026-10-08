"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Kanban, ListFilter, FileText } from "lucide-react";

import {
  getEvents,
  deleteEvent,
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
import EventLifecycleBoard from "@/components/manager/events/EventLifecycleBoard";
import EventEstimatesTab from "@/components/manager/events/EventEstimatesTab";
import EditEventModal from "@/components/manager/events/EditEventModal";
import DeleteEventModal from "@/components/manager/events/DeleteEventModal";
import { useAuth } from "@/hooks/useAuth";

type ViewMode = "list" | "pipeline" | "estimates";

function ManagerEventsContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  const [viewMode, setViewMode] = useState<ViewMode>(
    initialTab === "estimates"
      ? "estimates"
      : initialTab === "pipeline"
      ? "pipeline"
      : "list"
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EventStatus | "All">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "estimates") setViewMode("estimates");
    else if (tab === "pipeline") setViewMode("pipeline");
    else if (tab === "list" || !tab) setViewMode("list");
  }, [searchParams]);

  const handleTabChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (mode === "list") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", mode);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

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
        err instanceof Error
          ? err.message
          : "Failed to load events";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    if (viewMode === "list") {
      const timeout = setTimeout(() => {
        fetchEvents();
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [fetchEvents, viewMode]);

  const totalEvents = events.length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const isCompletedEvent = (st?: string) => {
    const s = (st || "").toLowerCase();
    return s === "completed" || s === "settled" || s === "invoiced" || s === "cancelled";
  };

  const isTodayDate = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
  };

  const ongoingEvents = events.filter((event) => {
    const s = (event.status || "").toLowerCase();
    if (isCompletedEvent(event.status)) return false;
    return (s === "ongoing" || s === "in_progress") && isTodayDate(event.eventDate);
  }).length;

  const upcomingEvents = events.filter((event) => {
    const s = (event.status || "").toLowerCase();
    if (isCompletedEvent(event.status)) return false;
    if ((s === "ongoing" || s === "in_progress") && isTodayDate(event.eventDate)) return false;
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="w-full">
        {/* Header & View Switcher */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
          <EventsHeader />

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl bg-gray-200/70 p-1">
            <button
              type="button"
              onClick={() => handleTabChange("list")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ListFilter size={15} />
              Events List
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("pipeline")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                viewMode === "pipeline"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Kanban size={15} />
              Pipeline
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("estimates")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                viewMode === "estimates"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText size={15} />
              Proposals & Estimates
            </button>
          </div>
        </div>

        {/* ESTIMATES TAB */}
        {viewMode === "estimates" && (
          <section className="mt-6">
            <EventEstimatesTab onSwitchToList={() => handleTabChange("list")} />
          </section>
        )}

        {/* PIPELINE KANBAN VIEW */}
        {viewMode === "pipeline" && (
          <section className="mt-6">
            <EventLifecycleBoard />
          </section>
        )}

        {/* STANDARD LIST VIEW */}
        {viewMode === "list" && (
          <>
            <section className="mt-5 max-w-3xl">
              <EventsStats
                total={totalEvents}
                upcoming={upcomingEvents}
                ongoing={ongoingEvents}
                completed={completedEvents}
              />
            </section>

            <section className="mt-6 max-w-3xl">
              <EventSearch value={search} onChange={setSearch} />
            </section>

            <section className="mt-4 max-w-3xl">
              <EventFilters value={status} onChange={setStatus} />
            </section>

            <section className="mt-6 max-w-3xl">
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
                />
              )}
            </section>
          </>
        )}
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
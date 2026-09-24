"use client";

import { useCallback, useEffect, useState } from "react";
import { Kanban, ListFilter } from "lucide-react";

import {
  getEvents,
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

type ViewMode = "pipeline" | "list";

export default function ManagerEventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("pipeline");
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EventStatus | "All">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const upcomingEvents = events.filter((event) => {
    if (event.status !== "Upcoming") return false;
    if (!event.eventDate) return false;
    const d = new Date(event.eventDate);
    if (isNaN(d.getTime())) return false;
    const eventEnd = new Date(d);
    eventEnd.setHours(23, 59, 59, 999);
    return eventEnd.getTime() >= todayStart.getTime();
  }).length;
  const ongoingEvents = events.filter((event) => event.status === "Ongoing").length;
  const completedEvents = events.filter((event) => event.status === "Completed").length;

  return (
    <main className="min-h-screen bg-[#F8F7F3]">
      <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 sm:px-6">
        {/* Header & View Switcher */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
          <EventsHeader />

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl bg-gray-200/70 p-1">
            <button
              type="button"
              onClick={() => setViewMode("pipeline")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                viewMode === "pipeline"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Kanban size={15} />
              Lifecycle Pipeline
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ListFilter size={15} />
              List View
            </button>
          </div>
        </div>

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
                <EventList events={events} />
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
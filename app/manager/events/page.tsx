"use client";

import { useCallback, useEffect, useState } from "react";

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

// ==========================================
// Page
// ==========================================

export default function ManagerEventsPage() {
  // ==========================================
  // State
  // ==========================================

  const [events, setEvents] = useState<Event[]>([]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<EventStatus | "All">("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // Fetch Events
  // ==========================================

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

  // ==========================================
  // Initial Load + Filters
  // ==========================================

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchEvents]);

  // ==========================================
  // Stats
  // ==========================================

  const totalEvents = events.length;

  const upcomingEvents = events.filter(
    (event) => event.status === "Upcoming"
  ).length;

  const ongoingEvents = events.filter(
    (event) => event.status === "Ongoing"
  ).length;

  const completedEvents = events.filter(
    (event) => event.status === "Completed"
  ).length;

  // ==========================================
  // Render
  // ==========================================

  return (
    <main className="min-h-screen bg-[#F8F7F3]">
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5 sm:px-6">
        {/* ======================================
            Header
        ====================================== */}

        <EventsHeader />

        {/* ======================================
            Stats
        ====================================== */}

        <section className="mt-5">
          <EventsStats
            total={totalEvents}
            upcoming={upcomingEvents}
            ongoing={ongoingEvents}
            completed={completedEvents}
          />
        </section>

        {/* ======================================
            Search
        ====================================== */}

        <section className="mt-6">
          <EventSearch
            value={search}
            onChange={setSearch}
          />
        </section>

        {/* ======================================
            Filters
        ====================================== */}

        <section className="mt-4">
          <EventFilters
            value={status}
            onChange={setStatus}
          />
        </section>

        {/* ======================================
            Content
        ====================================== */}

        <section className="mt-6">
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
      </div>
    </main>
  );
}
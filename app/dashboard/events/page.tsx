"use client";

import { useCallback, useEffect, useState } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EventStats from "@/components/dashboard/events/EventStats";
import EventFilters from "@/components/dashboard/events/EventFilters";
import EventsTable from "@/components/dashboard/events/EventsTable";
import EventCard from "@/components/dashboard/events/EventCard";

export interface ManagerEvent {
  id: string;
  name: string;
  type: string;
  customer?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  date: string;
  time: string;
  location: string;
  guests: number;
  package: string;
  amount: number;
  status:
    | "Pending"
    | "Confirmed"
    | "Completed"
    | "Cancelled";
  description?: string;
  assignedStaff?: {
    staff: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
    status: "Pending" | "Confirmed";
  }[];
}

interface EventsResponse {
  success: boolean;
  data?: {
    events: ManagerEvent[];
  };
  message?: string;
}

interface StatsResponse {
  success: boolean;
  data?: {
    stats: {
      total: number;
      upcoming: number;
      confirmed: number;
      pending: number;
    };
  };
  message?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<ManagerEvent[]>(
    []
  );

  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    confirmed: 0,
    pending: 0,
  });

  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState(
    "All Event Types"
  );
  const [status, setStatus] = useState(
    "All Statuses"
  );
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (eventType !== "All Event Types") {
        params.set("type", eventType);
      }

      if (status !== "All Statuses") {
        params.set("status", status);
      }

      if (date) {
        params.set("date", date);
      }

      const queryString = params.toString();

      const url =
        `${process.env.NEXT_PUBLIC_API_URL}/events` +
        (queryString ? `?${queryString}` : "");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: EventsResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load events"
        );
      }

      setEvents(result.data?.events || []);
    } catch (error) {
      console.error("Events error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  }, [search, eventType, status, date]);

  const fetchStats = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/stats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result: StatsResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load event statistics"
        );
      }

      setStats(
        result.data?.stats || {
          total: 0,
          upcoming: 0,
          confirmed: 0,
          pending: 0,
        }
      );
    } catch (error) {
      console.error("Event stats error:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <DashboardHeader role="manager" />

      {/* Event Statistics */}
      <EventStats stats={stats} />

      {/* Filters */}
      <EventFilters
        search={search}
        eventType={eventType}
        status={status}
        date={date}
        onSearchChange={setSearch}
        onEventTypeChange={setEventType}
        onStatusChange={setStatus}
        onDateChange={setDate}
      />

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#e8e1d8] border-t-[#a7773f]" />

            <p className="mt-3 text-sm text-[#756d64]">
              Loading events...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">
            Unable to load events
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <EventsTable events={events} />
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getEventById,
  type Event,
} from "@/lib/event.api";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

// ==========================================
// Page
// ==========================================

export default function ManagerEventDetailsPage() {
  const router = useRouter();
  const params = useParams();

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
    fetchEvent();
  }, [fetchEvent]);

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
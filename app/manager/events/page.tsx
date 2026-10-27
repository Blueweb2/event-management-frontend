"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X, Sparkles, FileText, ArrowRight } from "lucide-react";

import {
  getEvents,
  startEvent,
  updateEventStatus,
  type Event,
} from "@/lib/event.api";

import {
  getEstimates,
  convertEstimateToBooking,
  updateEstimateStatus as updateEstimateStatusApi,
  type Estimate,
} from "@/lib/estimates.api";

import EventsHeader from "@/components/manager/events/EventsHeader";
import EventFilters, { type EventFilterStatus } from "@/components/manager/events/EventFilters";
import EventSearch from "@/components/manager/events/EventSearch";
import EventList from "@/components/manager/events/EventList";
import EstimateList from "@/components/manager/events/EstimateList";
import EmptyEvents from "@/components/manager/events/EmptyEvents";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ClientDocumentModal from "@/components/manager/documents/ClientDocumentModal";
import {
  buildDocumentDataFromEvent,
  buildDocumentDataFromEstimate,
  type ClientDocumentData,
} from "@/lib/document-formatter";
import { useAuth } from "@/hooks/useAuth";
import { getManagerScope } from "@/lib/manager-navigation";

function ManagerEventsContent() {
  const { user, token } = useAuth();
  const scope = getManagerScope(user);
  const isOperationsManager = scope.departmentType === "operations";

  const [events, setEvents] = useState<Event[]>([]);
  const [allEstimates, setAllEstimates] = useState<Estimate[]>([]);
  const [ongoingCount, setOngoingCount] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EventFilterStatus>("Ongoing");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeDocument, setActiveDocument] = useState<ClientDocumentData | null>(null);
  const [acceptingEstimateId, setAcceptingEstimateId] = useState<string | null>(null);

  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Operational manager is restricted to only viewing Ongoing and Upcoming events
  useEffect(() => {
    if (isOperationsManager && status !== "Ongoing" && status !== "Upcoming") {
      setStatus("Ongoing");
    }
  }, [isOperationsManager, status]);

  // Fetch events and estimates
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (isOperationsManager) {
        // Operational manager only needs ongoing and upcoming events
        const activeStatus = status === "Ongoing" ? "Ongoing" : "Upcoming";

        const [eventsResponse, ongoingResponse] = await Promise.all([
          getEvents({
            search: search.trim() || undefined,
            status: activeStatus,
            page: 1,
            limit: 100,
          }).catch((err) => {
            console.error("Events fetch warning:", err);
            return { data: [] };
          }),
          activeStatus === "Ongoing"
            ? Promise.resolve(null)
            : getEvents({ status: "Ongoing", limit: 50 }).catch(() => ({ data: [] })),
        ]);

        const currentEvents = eventsResponse.data || [];
        setEvents(currentEvents);
        setAllEstimates([]);

        if (activeStatus === "Ongoing") {
          setOngoingCount(currentEvents.length);
        } else if (ongoingResponse?.data) {
          setOngoingCount(ongoingResponse.data.length);
        }
      } else {
        const isEstimateTab = status === "Estimates";

        // Parallel fetch events & estimates for superadmin / executive
        const [eventsResponse, estimatesResponse, ongoingResponse] = await Promise.all([
          getEvents({
            search: isEstimateTab ? undefined : search.trim() || undefined,
            status: isEstimateTab ? undefined : status,
            page: 1,
            limit: 100,
          }).catch((err) => {
            console.error("Events fetch warning:", err);
            return { data: [] };
          }),
          getEstimates({ limit: 100 }, token || undefined).catch((err) => {
            console.error("Estimates fetch warning:", err);
            return { data: [] };
          }),
          status === "Ongoing"
            ? Promise.resolve(null)
            : getEvents({ status: "Ongoing", limit: 50 }).catch(() => ({ data: [] })),
        ]);

        const currentEvents = eventsResponse.data || [];
        setEvents(currentEvents);
        setAllEstimates(estimatesResponse.data || []);

        if (status === "Ongoing") {
          setOngoingCount(currentEvents.length);
        } else if (ongoingResponse?.data) {
          setOngoingCount(ongoingResponse.data.length);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load events";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, status, token, isOperationsManager]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAllData();
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchAllData]);

  const isEstimateDateOver = (eventDateStr?: string) => {
    if (!eventDateStr) return false;
    const d = new Date(eventDateStr);
    if (isNaN(d.getTime())) return false;
    const eventEnd = new Date(d);
    eventEnd.setHours(23, 59, 59, 999);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventEnd.getTime() < today.getTime();
  };

  // Active proposals awaiting approval/acceptance (excluding converted, rejected, cancelled, or date-over estimates)
  const pendingEstimates = allEstimates.filter(
    (e) =>
      !e.convertedToEvent &&
      (e.status as string) !== "CONVERTED" &&
      e.status !== "ACCEPTED" &&
      e.status !== "REJECTED" &&
      e.status !== "CANCELLED" &&
      e.status !== "EXPIRED" &&
      !isEstimateDateOver(e.eventDate)
  );

  // Filter estimates by search query when on the Estimates tab
  const filteredEstimates = pendingEstimates.filter((est) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      est.eventName.toLowerCase().includes(q) ||
      (est.client?.name && est.client.name.toLowerCase().includes(q)) ||
      (est.client?.phone && est.client.phone.includes(q)) ||
      (est.location && est.location.toLowerCase().includes(q)) ||
      (est.estimateNumber && est.estimateNumber.toLowerCase().includes(q))
    );
  });

  // Action: Accept Estimate & Create Event
  const handleAcceptEstimate = async (estimate: Estimate) => {
    if (isEstimateDateOver(estimate.eventDate)) {
      setActionFeedback({
        type: "error",
        message: `Cannot accept proposal "${estimate.eventName}": the scheduled event date has already passed.`,
      });
      return;
    }

    setAcceptingEstimateId(estimate._id);
    try {
      await convertEstimateToBooking(estimate._id, token || undefined);
      setActionFeedback({
        type: "success",
        message: `Proposal "${estimate.eventName}" accepted! Event has been created and confirmed successfully.`,
      });
      // Refresh both events and estimates
      await fetchAllData();
      // Switch view to Upcoming to show the freshly created event
      setStatus("Upcoming");
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to convert estimate to event. Please try again.",
      });
    } finally {
      setAcceptingEstimateId(null);
    }
  };

  // Action: Reject Estimate
  const handleRejectEstimate = async (estimate: Estimate) => {
    try {
      await updateEstimateStatusApi(estimate._id, "REJECTED", token || undefined);
      setActionFeedback({
        type: "success",
        message: `Estimate "${estimate.eventName}" has been marked as rejected.`,
      });
      await fetchAllData();
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update estimate status.",
      });
    }
  };

  // Action: View/Print Estimate
  const handleExportEstimate = (estimate: Estimate) => {
    setActiveDocument(buildDocumentDataFromEstimate(estimate));
  };

  // Action: View/Print Event
  const handleExportEvent = (event: Event) => {
    setActiveDocument(buildDocumentDataFromEvent(event));
  };

  const handleStartEvent = async (event: Event) => {
    try {
      await startEvent(event._id, token || undefined);
      setActionFeedback({
        type: "success",
        message: `Operations for "${event.eventName}" have been started successfully!`,
      });
      setStatus("Ongoing");
      await fetchAllData();
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
      await fetchAllData();
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

  return (
    <div className="w-full max-w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="w-full max-w-full min-w-0">
        {/* Unified Header */}
        <div className="border-b border-gray-200 pb-5 w-full max-w-full min-w-0">
          <EventsHeader isOperationsManager={isOperationsManager} />
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`mt-4 flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-semibold shadow-xs transition w-full max-w-full min-w-0 ${
              actionFeedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
              className="text-gray-400 hover:text-gray-700 shrink-0 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Prominent Banner for Pending Booking Estimates (Hidden for Operations Manager) */}
        {!isOperationsManager && pendingEstimates.length > 0 && status !== "Estimates" && (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-amber-50/80 to-amber-100/50 p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in w-full max-w-full min-w-0 overflow-hidden">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-950 font-black text-xs sm:text-sm shadow-2xs">
                {pendingEstimates.length}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-amber-950 truncate max-w-full">
                    {pendingEstimates.length} New Booking Proposal{pendingEstimates.length > 1 ? "s" : ""} / Estimate{pendingEstimates.length > 1 ? "s" : ""}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-200/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-amber-900 shrink-0">
                    Awaiting Acceptance
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-800/90 mt-0.5 line-clamp-2 sm:line-clamp-none">
                  Review new booking requests, confirm service pricing, and convert them to live events.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStatus("Estimates")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#29241f] hover:bg-black text-white px-4 py-2 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs shrink-0"
            >
              <span>Review & Accept Proposals</span>
              <ArrowRight size={13} className="shrink-0" />
            </button>
          </div>
        )}

        {/* Search */}
        <section className="mt-4 sm:mt-5 w-full max-w-full min-w-0">
          <EventSearch
            value={search}
            onChange={setSearch}
          />
        </section>

        {/* Status Filters */}
        <section className="mt-3.5 sm:mt-4 w-full max-w-full min-w-0">
          <EventFilters
            value={status}
            onChange={setStatus}
            estimatesCount={pendingEstimates.length}
            ongoingCount={ongoingCount}
            isOperationsManager={isOperationsManager}
          />
        </section>

        {/* Unified Event List OR Estimates List */}
        <section className="mt-5 sm:mt-6 w-full max-w-full min-w-0">
          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <ErrorMessage message={error} />
              <button
                type="button"
                onClick={fetchAllData}
                className="mt-4 min-h-11 rounded-xl bg-[#252525] px-5 text-sm font-semibold text-white transition active:scale-[0.98] cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : status === "Estimates" ? (
            <EstimateList
              estimates={filteredEstimates}
              loading={loading}
              onAccept={handleAcceptEstimate}
              onExport={handleExportEstimate}
              onReject={handleRejectEstimate}
              acceptingId={acceptingEstimateId}
            />
          ) : events.length === 0 ? (
            <EmptyEvents
              title={
                status === "Ongoing"
                  ? "No ongoing events today"
                  : status === "Upcoming"
                  ? "No upcoming events"
                  : "No events found"
              }
              description={
                status === "Ongoing"
                  ? "There are no live events currently running."
                  : status === "Upcoming"
                  ? "No upcoming events scheduled."
                  : "Confirmed bookings will appear here as events."
              }
            />
          ) : (
            <EventList
              events={events}
              activeStatus={status}
              onStart={handleStartEvent}
              onAccept={handleAcceptEvent}
              onExport={handleExportEvent}
            />
          )}
        </section>
      </div>

      {/* Export Quotation / Invoice Modal (Handles both Events & Estimates) */}

      {/* Export Quotation / Invoice Modal (Handles both Events & Estimates) */}
      {activeDocument && (
        <ClientDocumentModal
          isOpen={Boolean(activeDocument)}
          onClose={() => setActiveDocument(null)}
          data={activeDocument}
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
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Play,
  Check,
  RefreshCw,
  FileText,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

import {
  getEstimates,
  updateEstimateStatus,
  convertEstimateToBooking,
  type Estimate,
} from "@/lib/estimates.api";

import {
  getEvents,
  updateEventStatus,
  startEvent,
  type Event,
} from "@/lib/event.api";

// ==========================================
// Types
// ==========================================

export type PipelineItemType = "ESTIMATE" | "EVENT";

export interface PipelineCardItem {
  id: string;
  type: PipelineItemType;
  title: string;
  eventType: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time?: string;
  guests?: number;
  location?: string;
  amount: number;
  status: string;
  rawEstimate?: Estimate;
  rawEvent?: Event;
}

interface ColumnConfig {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "draft_sent",
    title: "Draft / Sent Estimate",
    subtitle: "Awaiting client response",
    color: "border-blue-200 bg-blue-50/30",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
  },
  {
    id: "accepted",
    title: "Accepted Estimate",
    subtitle: "Ready to convert to Live Event",
    color: "border-amber-200 bg-amber-50/30",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
  },
  {
    id: "upcoming",
    title: "Upcoming Event",
    subtitle: "Confirmed & ready to start",
    color: "border-emerald-200 bg-emerald-50/30",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
  },
  {
    id: "ongoing",
    title: "Ongoing Event",
    subtitle: "In progress - clock in enabled",
    color: "border-indigo-200 bg-indigo-50/30",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-800",
  },
  {
    id: "completed",
    title: "Completed Event",
    subtitle: "Event finished successfully",
    color: "border-gray-200 bg-gray-50/50",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-800",
  },
  {
    id: "invoiced",
    title: "Invoiced & Settled",
    subtitle: "Invoice generated & paid",
    color: "border-purple-200 bg-purple-50/40",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
  },
];

export default function EventLifecycleBoard() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ==========================================
  // Fetch Board Data
  // ==========================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [estRes, evtRes] = await Promise.allSettled([
        getEstimates({ limit: 100 }),
        getEvents({ limit: 100 }),
      ]);

      if (estRes.status === "fulfilled" && estRes.value.data) {
        setEstimates(estRes.value.data);
      }

      if (evtRes.status === "fulfilled" && evtRes.value.data) {
        setEvents(evtRes.value.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Flash message helper
  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // ==========================================
  // Actions
  // ==========================================

  const handleConvertEstimate = async (estimateId: string) => {
    try {
      setActionLoading(estimateId);
      setError(null);

      const result = await convertEstimateToBooking(estimateId);
      showToast(`🎉 Estimate converted to event "${result.event.eventName}"!`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert estimate");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateEstimateStatus = async (estimateId: string, newStatus: any) => {
    try {
      setActionLoading(estimateId);
      setError(null);

      await updateEstimateStatus(estimateId, newStatus);
      showToast(`Estimate status updated to ${newStatus}`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update estimate status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartEventAction = async (eventId: string) => {
    try {
      setActionLoading(eventId);
      setError(null);

      await startEvent(eventId);
      showToast("🚀 Event started! Staff clock-in is now enabled.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start event");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateEventStatus = async (eventId: string, newStatus: any) => {
    try {
      setActionLoading(eventId);
      setError(null);

      await updateEventStatus(eventId, newStatus);
      showToast(`Event status updated to ${newStatus}`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event status");
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // Group Items into Pipeline Columns
  // ==========================================

  const draftSentCards: PipelineCardItem[] = estimates
    .filter((est) => ["DRAFT", "SENT", "VIEWED"].includes(est.status))
    .map((est) => ({
      id: est._id,
      type: "ESTIMATE",
      title: est.eventName,
      eventType: est.eventType,
      clientName: est.client?.name || "Client",
      clientEmail: est.client?.email || "",
      clientPhone: est.client?.phone || "",
      date: est.eventDate,
      time: est.eventTime,
      guests: est.guests,
      location: est.location,
      amount: est.total,
      status: est.status,
      rawEstimate: est,
    }));

  const acceptedCards: PipelineCardItem[] = estimates
    .filter((est) => est.status === "ACCEPTED")
    .map((est) => ({
      id: est._id,
      type: "ESTIMATE",
      title: est.eventName,
      eventType: est.eventType,
      clientName: est.client?.name || "Client",
      clientEmail: est.client?.email || "",
      clientPhone: est.client?.phone || "",
      date: est.eventDate,
      time: est.eventTime,
      guests: est.guests,
      location: est.location,
      amount: est.total,
      status: est.status,
      rawEstimate: est,
    }));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingCards: PipelineCardItem[] = events
    .filter((evt) => {
      const isUpcoming = ["Upcoming", "CONFIRMED", "READY_TO_START"].includes(evt.status);
      if (!isUpcoming) return false;
      if (!evt.eventDate) return false;
      const d = new Date(evt.eventDate);
      if (isNaN(d.getTime())) return false;
      const eventEnd = new Date(d);
      eventEnd.setHours(23, 59, 59, 999);
      return eventEnd.getTime() >= todayStart.getTime();
    })
    .map((evt): PipelineCardItem => ({
      id: evt._id,
      type: "EVENT",
      title: evt.eventName,
      eventType: evt.eventType,
      clientName: typeof evt.client === "object" && evt.client ? evt.client.name : "Client",
      clientEmail: typeof evt.client === "object" && evt.client ? evt.client.email : "",
      clientPhone: typeof evt.client === "object" && evt.client ? evt.client.phone : "",
      date: evt.eventDate,
      time: evt.eventTime,
      guests: evt.guests,
      location: evt.location,
      amount: 0,
      status: evt.status,
      rawEvent: evt,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const ongoingCards: PipelineCardItem[] = events
    .filter((evt) => ["Ongoing", "IN_PROGRESS"].includes(evt.status))
    .map((evt) => ({
      id: evt._id,
      type: "EVENT",
      title: evt.eventName,
      eventType: evt.eventType,
      clientName: typeof evt.client === "object" && evt.client ? evt.client.name : "Client",
      clientEmail: typeof evt.client === "object" && evt.client ? evt.client.email : "",
      clientPhone: typeof evt.client === "object" && evt.client ? evt.client.phone : "",
      date: evt.eventDate,
      time: evt.eventTime,
      guests: evt.guests,
      location: evt.location,
      amount: 0,
      status: evt.status,
      rawEvent: evt,
    }));

  const completedCards: PipelineCardItem[] = events
    .filter((evt) => evt.status === "Completed")
    .map((evt) => ({
      id: evt._id,
      type: "EVENT",
      title: evt.eventName,
      eventType: evt.eventType,
      clientName: typeof evt.client === "object" && evt.client ? evt.client.name : "Client",
      clientEmail: typeof evt.client === "object" && evt.client ? evt.client.email : "",
      clientPhone: typeof evt.client === "object" && evt.client ? evt.client.phone : "",
      date: evt.eventDate,
      time: evt.eventTime,
      guests: evt.guests,
      location: evt.location,
      amount: 0,
      status: evt.status,
      rawEvent: evt,
    }));

  const invoicedCards: PipelineCardItem[] = events
    .filter((evt) => (evt.status as string) === "Invoiced" || (evt.status as string) === "Settled")
    .map((evt) => ({
      id: evt._id,
      type: "EVENT",
      title: evt.eventName,
      eventType: evt.eventType,
      clientName: typeof evt.client === "object" && evt.client ? evt.client.name : "Client",
      clientEmail: typeof evt.client === "object" && evt.client ? evt.client.email : "",
      clientPhone: typeof evt.client === "object" && evt.client ? evt.client.phone : "",
      date: evt.eventDate,
      time: evt.eventTime,
      guests: evt.guests,
      location: evt.location,
      amount: typeof evt.booking === "object" && evt.booking ? Number((evt.booking as any).total || 0) : 0,
      status: evt.status,
      rawEvent: evt,
    }));

  const getCardsForColumn = (colId: string): PipelineCardItem[] => {
    switch (colId) {
      case "draft_sent":
        return draftSentCards;
      case "accepted":
        return acceptedCards;
      case "upcoming":
        return upcomingCards;
      case "ongoing":
        return ongoingCards;
      case "completed":
        return completedCards;
      case "invoiced":
        return invoicedCards;
      default:
        return [];
    }
  };

  if (loading && estimates.length === 0 && events.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-[#9A7B4F]" />
        <p className="text-sm font-medium text-gray-500">Loading Lifecycle Board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 shadow-sm">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lifecycle Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin">
        {COLUMNS.map((col) => {
          const cards = getCardsForColumn(col.id);

          return (
            <div
              key={col.id}
              className={`flex w-80 shrink-0 flex-col rounded-3xl border ${col.color} p-4 shadow-sm`}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{col.title}</h3>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${col.badgeBg} ${col.badgeText} text-xs font-bold`}
                    >
                      {cards.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">{col.subtitle}</p>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex flex-1 flex-col gap-3">
                {cards.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 p-4 text-center text-xs text-gray-400">
                    No items in this stage
                  </div>
                ) : (
                  cards.map((card) => {
                    const isProcessing = actionLoading === card.id;

                    return (
                      <div
                        key={card.id}
                        className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                      >
                        {/* Type & Amount Header */}
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              card.type === "ESTIMATE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {card.type === "ESTIMATE" ? "Estimate" : "Event"}
                          </span>

                          {card.amount > 0 && (
                            <span className="flex items-center font-mono text-xs font-bold text-gray-900">
                              <IndianRupee size={11} />
                              {card.amount.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                          {card.title}
                        </h4>

                        {/* Client & Date details */}
                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                          <p className="truncate font-medium text-gray-700">
                            👤 {card.clientName}
                          </p>

                          {card.date && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="shrink-0 text-gray-400" />
                              <span>{card.date.slice(0, 10)}</span>
                              {card.time && <span>• {card.time}</span>}
                            </div>
                          )}

                          {card.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="shrink-0 text-gray-400" />
                              <span className="truncate">{card.location}</span>
                            </div>
                          )}

                          {card.guests && (
                            <div className="flex items-center gap-1">
                              <Users size={12} className="shrink-0 text-gray-400" />
                              <span>{card.guests} Guests</span>
                            </div>
                          )}
                        </div>

                        {/* Dynamic Stage Actions */}
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          {/* Column 1: Draft / Sent Estimate Actions */}
                          {col.id === "draft_sent" && (
                            <div className="flex items-center gap-2">
                              {card.status === "DRAFT" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateEstimateStatus(card.id, "SENT")}
                                  disabled={isProcessing}
                                  className="flex-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {isProcessing ? "Updating..." : "Mark Sent"}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleUpdateEstimateStatus(card.id, "ACCEPTED")}
                                disabled={isProcessing}
                                className="flex-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {isProcessing ? "Updating..." : "Accept"}
                              </button>
                            </div>
                          )}

                          {/* Column 2: Accepted Estimate -> CONVERT ACTION */}
                          {col.id === "accepted" && (
                            <button
                              type="button"
                              onClick={() => handleConvertEstimate(card.id)}
                              disabled={isProcessing}
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <RefreshCw size={13} className="animate-spin" />
                              ) : (
                                <Sparkles size={13} />
                              )}
                              <span>{isProcessing ? "Converting..." : "Convert to Event"}</span>
                              <ArrowRight size={13} />
                            </button>
                          )}

                          {/* Column 3: Upcoming Event -> START ACTION */}
                          {col.id === "upcoming" && (() => {
                            const todayStr = new Date().toISOString().slice(0, 10);
                            const eventDateStr = card.date ? new Date(card.date).toISOString().slice(0, 10) : "";
                            const canStart = eventDateStr ? todayStr >= eventDateStr : false;
                            const formattedDate = card.date
                              ? new Date(card.date).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "";

                            return (
                              <div className="space-y-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEventAction(card.id)}
                                  disabled={isProcessing || !canStart}
                                  className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm transition ${
                                    canStart
                                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-[0.98]"
                                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  } disabled:opacity-60`}
                                >
                                  <Play size={13} className="fill-current" />
                                  <span>{isProcessing ? "Starting Event..." : "Start Event"}</span>
                                </button>

                                {!canStart && formattedDate && (
                                  <p className="text-center text-[11px] font-medium text-amber-700 bg-amber-50 rounded-lg py-1 px-2 border border-amber-200/60">
                                    Event can be started on {formattedDate}.
                                  </p>
                                )}
                              </div>
                            );
                          })()}

                          {/* Column 4: Ongoing Event -> COMPLETE ACTION & STARTED DETAILS */}
                          {col.id === "ongoing" && (
                            <div className="space-y-2">
                              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-2 text-[11px] space-y-1 text-indigo-900">
                                <div className="flex items-center justify-between font-semibold text-indigo-700">
                                  <span>Status: IN PROGRESS</span>
                                  <span className="rounded bg-indigo-200/80 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
                                    Clock-In: ENABLED
                                  </span>
                                </div>

                                {card.rawEvent?.startedAt && (
                                  <p className="text-gray-600">
                                    Started:{" "}
                                    <span className="font-medium text-gray-900">
                                      {new Date(card.rawEvent.startedAt).toLocaleString("en-US", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </span>
                                  </p>
                                )}

                                {card.rawEvent?.startedBy && (
                                  <p className="text-gray-600">
                                    Started By:{" "}
                                    <span className="font-medium text-gray-900">
                                      {typeof card.rawEvent.startedBy === "object"
                                        ? card.rawEvent.startedBy.name
                                        : "Manager"}
                                    </span>
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleUpdateEventStatus(card.id, "Completed")}
                                disabled={isProcessing}
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <CheckCircle2 size={13} />
                                <span>{isProcessing ? "Completing..." : "Complete Event"}</span>
                              </button>
                            </div>
                          )}

                          {/* Column 5: Completed -> SHOW DETAILS & INVOICE ACTION */}
                          {col.id === "completed" && (
                            <div className="space-y-2">
                              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-2 text-[11px] space-y-1 text-emerald-900">
                                <div className="flex items-center justify-between font-semibold text-emerald-700">
                                  <span>Status: COMPLETED</span>
                                  <span className="rounded bg-emerald-200/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                    Ready for Billing
                                  </span>
                                </div>

                                {card.rawEvent?.completedAt && (
                                  <p className="text-gray-600">
                                    Finished:{" "}
                                    <span className="font-medium text-gray-900">
                                      {new Date(card.rawEvent.completedAt).toLocaleString("en-US", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </span>
                                  </p>
                                )}

                                {card.rawEvent?.completedBy && (
                                  <p className="text-gray-600">
                                    Completed By:{" "}
                                    <span className="font-medium text-gray-900">
                                      {typeof card.rawEvent.completedBy === "object"
                                        ? card.rawEvent.completedBy.name
                                        : "Manager"}
                                    </span>
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleUpdateEventStatus(card.id, "Invoiced")}
                                disabled={isProcessing}
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-purple-700 disabled:opacity-50"
                              >
                                <FileText size={13} />
                                <span>{isProcessing ? "Updating..." : "Generate & Settle Invoice"}</span>
                              </button>
                            </div>
                          )}

                          {/* Column 6: Invoiced & Settled */}
                          {col.id === "invoiced" && (
                            <div className="rounded-xl border border-purple-100 bg-purple-50/70 p-2.5 text-[11px] space-y-1.5 text-purple-900">
                              <div className="flex items-center gap-1.5 font-bold text-purple-800">
                                <CheckCircle2 size={14} className="text-purple-600 shrink-0" />
                                <span>Invoiced & Fully Settled</span>
                              </div>

                              {card.rawEvent?.invoicedAt && (
                                <p className="text-gray-600">
                                  Invoiced:{" "}
                                  <span className="font-medium text-gray-900">
                                    {new Date(card.rawEvent.invoicedAt).toLocaleString("en-US", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                                  </span>
                                </p>
                              )}

                              {card.rawEvent?.invoicedBy && (
                                <p className="text-gray-600">
                                  Invoiced By:{" "}
                                  <span className="font-medium text-gray-900">
                                    {typeof card.rawEvent.invoicedBy === "object"
                                      ? card.rawEvent.invoicedBy.name
                                      : "Manager"}
                                  </span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

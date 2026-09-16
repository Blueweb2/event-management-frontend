"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  getEstimates,
  updateEstimateStatus,
  convertEstimateToBooking,
} from "@/lib/estimates.api";

type EstimateStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

type Estimate = {
  _id: string;
  estimateNumber: string;

  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: number;
  location: string;
  description: string;

  client: {
    name: string;
    phone: string;
    email: string;
  };

  subtotal: number;
  discount: number;
  additionalCharges: number;
  total: number;
  currency: string;

  status: EstimateStatus;

  createdAt: string;
};

const statusStyles: Record<
  EstimateStatus,
  string
> = {
  DRAFT:
    "bg-gray-100 text-gray-700",
  SENT:
    "bg-blue-50 text-blue-700",
  VIEWED:
    "bg-purple-50 text-purple-700",
  ACCEPTED:
    "bg-green-50 text-green-700",
  REJECTED:
    "bg-red-50 text-red-700",
  EXPIRED:
    "bg-orange-50 text-orange-700",
  CANCELLED:
    "bg-gray-100 text-gray-500",
};

const statusLabels: Record<
  EstimateStatus,
  string
> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export default function EstimatesPage() {
  const router = useRouter();

  const [estimates, setEstimates] =
    useState<Estimate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | EstimateStatus>("ALL");

  // Track which estimate is currently being converted
  const [convertingId, setConvertingId] =
    useState<string | null>(null);

  const [acceptingId, setAcceptingId] =
    useState<string | null>(null);

  const [convertSuccess, setConvertSuccess] =
    useState<string | null>(null);

  const [convertError, setConvertError] =
    useState<string | null>(null);

  const [acceptError, setAcceptError] =
    useState<string | null>(null);

  const [selectedEstimate, setSelectedEstimate] =
    useState<Estimate | null>(null);

  const handleAccept = async (
    estimateId: string,
    estimateName: string,
  ) => {
    if (acceptingId || convertingId) return;

    setAcceptingId(estimateId);
    setAcceptError(null);
    setConvertError(null);

    try {
      await updateEstimateStatus(
        estimateId,
        "ACCEPTED",
      );

      setEstimates((current) =>
        current.map((estimate) =>
          estimate._id === estimateId
            ? {
                ...estimate,
                status: "ACCEPTED",
              }
            : estimate,
        ),
      );
    } catch (err) {
      setAcceptError(
        err instanceof Error
          ? err.message
          : `Unable to accept ${estimateName}. Please try again.`,
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const handleConvert = async (
    estimateId: string,
    estimateName: string,
  ) => {
    if (convertingId) return;

    setConvertingId(estimateId);
    setConvertError(null);
    setConvertSuccess(null);

    try {
      await convertEstimateToBooking(
        estimateId,
      );

      setConvertSuccess(
        `"${estimateName}" converted to event successfully.`,
      );

      // Navigate to events list after a brief delay
      setTimeout(() => {
        router.push("/manager/events");
      }, 1200);
    } catch (err) {
      setConvertError(
        err instanceof Error
          ? err.message
          : "Failed to convert estimate. Please try again.",
      );
    } finally {
      setConvertingId(null);
    }
  };

  const loadEstimates = async (
    refresh = false,
  ) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const result = await getEstimates();
      setEstimates(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load estimates.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEstimates();
  }, []);

  const filteredEstimates = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    return estimates.filter(
      (estimate) => {
        const matchesStatus =
          statusFilter === "ALL" ||
          estimate.status ===
            statusFilter;

        const matchesSearch =
          !value ||
          estimate.estimateNumber
            .toLowerCase()
            .includes(value) ||
          estimate.eventName
            .toLowerCase()
            .includes(value) ||
          estimate.client.name
            .toLowerCase()
            .includes(value) ||
          estimate.client.email
            .toLowerCase()
            .includes(value);

        return (
          matchesStatus &&
          matchesSearch
        );
      },
    );
  }, [
    estimates,
    search,
    statusFilter,
  ]);

  const totalValue = estimates.reduce(
    (sum, estimate) =>
      sum + Number(estimate.total || 0),
    0,
  );

  const acceptedCount =
    estimates.filter(
      (estimate) =>
        estimate.status === "ACCEPTED",
    ).length;

  const draftCount =
    estimates.filter(
      (estimate) =>
        estimate.status === "DRAFT",
    ).length;

  const formatCurrency = (
    amount: number,
    currency = "INR",
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      },
    ).format(amount);
  };

  const formatDate = (
    date: string,
  ) => {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ).format(new Date(date));
  };

  return (
    <main className="min-h-screen bg-[var(--ivory)]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[var(--ink)] sm:text-2xl">
                Estimates
              </h1>

              <p className="mt-1 text-sm text-[var(--muted)]">
                View and manage customer
                estimates.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadEstimates(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--ivory)] disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                Total Estimates
              </p>

              <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                {estimates.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                Drafts
              </p>

              <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                {draftCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                Accepted
              </p>

              <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                {acceptedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                Estimate Value
              </p>

              <p className="mt-2 text-xl font-semibold text-[var(--ink)]">
                {formatCurrency(
                  totalValue,
                )}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-medium">
                  Unable to load estimates
                </p>

                <p className="mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Convert success banner */}
          {convertSuccess && (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <CheckCircle2
                size={18}
                className="shrink-0 text-green-600"
              />
              <p className="font-medium">{convertSuccess}</p>
              <p className="text-green-600">Redirecting to Events…</p>
            </div>
          )}

          {/* Convert error banner */}
          {convertError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />
              <div>
                <p className="font-medium">Conversion failed</p>
                <p className="mt-1">{convertError}</p>
              </div>
            </div>
          )}

          {acceptError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>{acceptError}</div>
            </div>
          )}

          {/* Filters */}
          <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search by estimate, event or client..."
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--ivory)]/30 py-3 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as
                      | "ALL"
                      | EstimateStatus,
                  )
                }
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--ivory)]/30 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 lg:w-auto"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="DRAFT">
                  Draft
                </option>

                <option value="SENT">
                  Sent
                </option>

                <option value="VIEWED">
                  Viewed
                </option>

                <option value="ACCEPTED">
                  Accepted
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

                <option value="EXPIRED">
                  Expired
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-xl bg-[var(--ivory)]"
                  />
                ))}
              </div>
            ) : filteredEstimates.length ===
              0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ivory)]">
                  <FileText
                    size={20}
                    className="text-[var(--muted)]"
                  />
                </div>

                <h3 className="mt-4 text-base font-semibold text-[var(--ink)]">
                  No estimates found
                </h3>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Try changing your search
                  or status filter.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--ivory)]/40">
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Estimate
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Event
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Client
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Event Date
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Total
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEstimates.map(
                      (estimate) => (
                        <tr
                          key={
                            estimate._id
                          }
                          className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--ivory)]/30"
                        >
                          {/* Estimate */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[var(--ink)]">
                              {
                                estimate.estimateNumber
                              }
                            </p>

                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {formatDate(
                                estimate.createdAt,
                              )}
                            </p>
                          </td>

                          {/* Event */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-[var(--ink)]">
                              {
                                estimate.eventName
                              }
                            </p>

                            <p className="mt-1 text-xs capitalize text-[var(--muted)]">
                              {
                                estimate.eventType
                              }{" "}
                              ·{" "}
                              {
                                estimate.guests
                              }{" "}
                              guests
                            </p>
                          </td>

                          {/* Client */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-[var(--ink)]">
                              {
                                estimate
                                  .client
                                  .name
                              }
                            </p>

                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {
                                estimate
                                  .client
                                  .email
                              }
                            </p>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-[var(--ink)]">
                              <CalendarDays
                                size={15}
                                className="text-[var(--muted)]"
                              />

                              {formatDate(
                                estimate.eventDate,
                              )}
                            </div>
                          </td>

                          {/* Total */}
                          <td className="px-5 py-4 text-right">
                            <p className="text-sm font-semibold text-[var(--ink)]">
                              {formatCurrency(
                                estimate.total,
                                estimate.currency,
                              )}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                                statusStyles[
                                  estimate
                                    .status
                                ]
                              }`}
                            >
                              {
                                statusLabels[
                                  estimate
                                    .status
                                ]
                              }
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-right">
                            {(estimate.status === "DRAFT" ||
                              estimate.status === "SENT" ||
                              estimate.status === "VIEWED") && (
                              <button
                                type="button"
                                id={`accept-estimate-${estimate._id}`}
                                disabled={
                                  acceptingId === estimate._id ||
                                  Boolean(convertingId)
                                }
                                onClick={() =>
                                  handleAccept(
                                    estimate._id,
                                    estimate.eventName,
                                  )
                                }
                                className="mr-2 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                              >
                                {acceptingId === estimate._id ? (
                                  <>
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                    Accepting...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={14} />
                                    Accept
                                  </>
                                )}
                              </button>
                            )}

                            {estimate.status ===
                            "ACCEPTED" ? (
                              <button
                                type="button"
                                id={`convert-estimate-${estimate._id}`}
                                disabled={
                                  convertingId ===
                                  estimate._id
                                }
                                onClick={() =>
                                  handleConvert(
                                    estimate._id,
                                    estimate.eventName,
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                              >
                                {convertingId ===
                                estimate._id ? (
                                  <>
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                    Converting…
                                  </>
                                ) : (
                                  <>
                                    <ArrowRight
                                      size={14}
                                    />
                                    Convert to Event
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedEstimate(estimate)
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--ivory)]"
                              >
                                <Eye
                                  size={15}
                                />

                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
                </div>

                <div className="space-y-3 p-3 md:hidden">
                {filteredEstimates.map((estimate) => (
                  <article
                    key={estimate._id}
                    className="rounded-xl border border-[var(--line)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          {estimate.estimateNumber}
                        </p>
                        <h2 className="mt-1 truncate text-base font-semibold text-[var(--ink)]">
                          {estimate.eventName}
                        </h2>
                        <p className="mt-1 truncate text-sm text-[var(--muted)]">
                          {estimate.client.name}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[estimate.status]}`}
                      >
                        {statusLabels[estimate.status]}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[var(--line)] py-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                          Event date
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-[var(--ink)]">
                          <CalendarDays size={14} className="text-[var(--muted)]" />
                          {formatDate(estimate.eventDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                          Total
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                          {formatCurrency(estimate.total, estimate.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      {(estimate.status === "DRAFT" ||
                        estimate.status === "SENT" ||
                        estimate.status === "VIEWED") && (
                        <button
                          type="button"
                          disabled={
                            acceptingId === estimate._id ||
                            Boolean(convertingId)
                          }
                          onClick={() =>
                            handleAccept(estimate._id, estimate.eventName)
                          }
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                        >
                          {acceptingId === estimate._id ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              Accepting...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={15} />
                              Accept estimate
                            </>
                          )}
                        </button>
                      )}

                      {estimate.status === "ACCEPTED" ? (
                        <button
                          type="button"
                          disabled={convertingId === estimate._id}
                          onClick={() =>
                            handleConvert(estimate._id, estimate.eventName)
                          }
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                        >
                          {convertingId === estimate._id ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              Converting...
                            </>
                          ) : (
                            <>
                              <ArrowRight size={15} />
                              Convert to event
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedEstimate(estimate)}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--ivory)]"
                        >
                          <Eye size={16} />
                          View details
                        </button>
                      )}
                    </div>
                  </article>
                ))}
                </div>
              </>
            )}
          </div>

          {!loading &&
            filteredEstimates.length >
              0 && (
              <p className="text-center text-xs text-[var(--muted)]">
                Showing{" "}
                {filteredEstimates.length}{" "}
                of {estimates.length}{" "}
                estimates
              </p>
            )}
        </div>
      </div>

      {selectedEstimate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="estimate-details-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEstimate(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {selectedEstimate.estimateNumber}
                </p>
                <h2
                  id="estimate-details-title"
                  className="mt-1 text-xl font-semibold text-[var(--ink)]"
                >
                  {selectedEstimate.eventName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEstimate(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--ivory)] hover:text-[var(--ink)]"
                aria-label="Close estimate details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--ivory)] p-4">
                <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Event</p>
                <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                  {selectedEstimate.eventType} · {selectedEstimate.guests} guests
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {formatDate(selectedEstimate.eventDate)} at {selectedEstimate.eventTime}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {selectedEstimate.location}
                </p>
              </div>

              <div className="rounded-xl bg-[var(--ivory)] p-4">
                <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Client</p>
                <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                  {selectedEstimate.client.name}
                </p>
                <p className="mt-1 break-all text-sm text-[var(--muted)]">
                  {selectedEstimate.client.email}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {selectedEstimate.client.phone}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--line)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--ink)]">Estimate summary</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[selectedEstimate.status]}`}
                >
                  {statusLabels[selectedEstimate.status]}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">
                {selectedEstimate.description || "No description provided."}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
                <span className="text-sm text-[var(--muted)]">Total</span>
                <span className="text-lg font-semibold text-[var(--ink)]">
                  {formatCurrency(selectedEstimate.total, selectedEstimate.currency)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedEstimate(null)}
                className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--ivory)]"
              >
                Close
              </button>

              {(selectedEstimate.status === "DRAFT" ||
                selectedEstimate.status === "SENT" ||
                selectedEstimate.status === "VIEWED") && (
                <button
                  type="button"
                  disabled={acceptingId === selectedEstimate._id}
                  onClick={() =>
                    handleAccept(
                      selectedEstimate._id,
                      selectedEstimate.eventName,
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {acceptingId === selectedEstimate._id && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Accept estimate
                </button>
              )}

              {selectedEstimate.status === "ACCEPTED" && (
                <button
                  type="button"
                  disabled={convertingId === selectedEstimate._id}
                  onClick={() =>
                    handleConvert(
                      selectedEstimate._id,
                      selectedEstimate.eventName,
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {convertingId === selectedEstimate._id && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Convert to event
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
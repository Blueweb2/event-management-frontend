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
} from "lucide-react";

import {
  getEstimates,
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
  guests: number;
  location: string;

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

  const [convertSuccess, setConvertSuccess] =
    useState<string | null>(null);

  const [convertError, setConvertError] =
    useState<string | null>(null);

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--ink)]">
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
                className="rounded-xl border border-[var(--line)] bg-[var(--ivory)]/30 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
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
              <div className="overflow-x-auto">
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
    </main>
  );
}
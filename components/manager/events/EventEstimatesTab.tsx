"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  CircleCheck,
  Eye,
  FileEdit,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";

import {
  getEstimates,
  getEstimateById,
  updateEstimateStatus,
  convertEstimateToBooking,
} from "@/lib/estimates.api";
import EstimateExportActions from "@/components/estimates/EstimateExportActions";
import ClientDocumentModal from "@/components/manager/documents/ClientDocumentModal";
import {
  type ClientDocumentData,
  defaultCompanyDetails,
} from "@/lib/document-formatter";

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

  items?: Array<{
    _id: string;
    serviceName: string;
    category: string;
    quantity: number;
    unitLabel?: string;
    unitPrice: number;
    total: number;
  }>;
  foodMenu?: any;

  subtotal: number;
  discount: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  additionalCharges: number;
  gstRate?: number;
  gstAmount?: number;
  total: number;
  currency: string;

  status: EstimateStatus;

  createdAt: string;
};

function buildDocumentDataFromEstimate(est: Estimate): ClientDocumentData {
  return {
    documentType: est.status === "ACCEPTED" ? "INVOICE" : "ESTIMATE",
    documentNumber: est.estimateNumber,
    date: est.createdAt || new Date().toISOString(),
    status: est.status,
    company: defaultCompanyDetails,
    client: {
      name: est.client?.name || "Client",
      phone: est.client?.phone || "",
      email: est.client?.email || "",
    },
    event: {
      name: est.eventName,
      type: est.eventType,
      date: est.eventDate,
      time: est.eventTime,
      guests: est.guests,
      location: est.location,
      description: est.description,
    },
    services:
      Array.isArray(est.items) && est.items.length > 0
        ? est.items.map((item, idx) => ({
            id: item._id || String(idx),
            name: item.serviceName,
            category: item.category,
            quantity: item.quantity,
            unitLabel: item.unitLabel,
            unitPrice: item.unitPrice,
            total: item.total,
          }))
        : [
            {
              id: "1",
              name: "Full Event Management & Production",
              quantity: 1,
              unitPrice: est.subtotal || est.total,
              total: est.subtotal || est.total,
            },
          ],
    catering:
      est.foodMenu && est.foodMenu.included
        ? {
            included: true,
            servingType: est.foodMenu.servingType,
            ratePerGuest: est.foodMenu.ratePerGuest,
            totalFoodAmount: est.foodMenu.totalFoodAmount,
            guestCount: est.guests,
            notes: est.foodMenu.notes,
            items: est.foodMenu.items,
          }
        : undefined,
    subtotal: est.subtotal || est.total,
    discount: est.discount || 0,
    discountType: est.discountType,
    discountValue: est.discountValue,
    additionalCharges: est.additionalCharges || 0,
    gstRate: est.gstRate || 18,
    gstAmount: est.gstAmount || 0,
    total: est.total,
    currency: est.currency || "INR",
  };
}

const statusStyles: Record<EstimateStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-50 text-blue-700",
  VIEWED: "bg-purple-50 text-purple-700",
  ACCEPTED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  EXPIRED: "bg-orange-50 text-orange-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<EstimateStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export default function EventEstimatesTab({
  onSwitchToList,
}: {
  onSwitchToList?: () => void;
}) {
  const router = useRouter();

  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EstimateStatus>("ALL");

  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [convertSuccess, setConvertSuccess] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [studioModalOpen, setStudioModalOpen] = useState(false);
  const [studioDocData, setStudioDocData] = useState<ClientDocumentData | null>(null);

  const handleOpenStudio = async (estimate: Estimate) => {
    try {
      const full = await getEstimateById(estimate._id);
      setStudioDocData(buildDocumentDataFromEstimate(full || estimate));
    } catch {
      setStudioDocData(buildDocumentDataFromEstimate(estimate));
    }
    setStudioModalOpen(true);
  };

  const handleSelectEstimate = async (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    try {
      const full = await getEstimateById(estimate._id);
      if (full) {
        setSelectedEstimate((curr) =>
          curr && curr._id === estimate._id ? { ...curr, ...full } : curr
        );
      }
    } catch {
      // Keep existing
    }
  };

  const handleAccept = async (estimateId: string, estimateName: string) => {
    if (acceptingId || convertingId) return;

    setAcceptingId(estimateId);
    setAcceptError(null);
    setConvertError(null);

    try {
      await updateEstimateStatus(estimateId, "ACCEPTED");

      setEstimates((current) =>
        current.map((estimate) =>
          estimate._id === estimateId
            ? { ...estimate, status: "ACCEPTED" }
            : estimate
        )
      );
    } catch (err) {
      setAcceptError(
        err instanceof Error
          ? err.message
          : `Unable to accept ${estimateName}. Please try again.`
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const handleConvert = async (estimateId: string, estimateName: string) => {
    if (convertingId) return;

    setConvertingId(estimateId);
    setConvertError(null);
    setConvertSuccess(null);

    try {
      await convertEstimateToBooking(estimateId);

      setConvertSuccess(`"${estimateName}" converted to event successfully.`);

      setTimeout(() => {
        if (onSwitchToList) {
          onSwitchToList();
        } else {
          router.push("/manager/events");
        }
      }, 1200);
    } catch (err) {
      setConvertError(
        err instanceof Error
          ? err.message
          : "Failed to convert estimate. Please try again."
      );
    } finally {
      setConvertingId(null);
    }
  };

  const loadEstimates = async (refresh = false) => {
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
      setError(err instanceof Error ? err.message : "Failed to load estimates.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEstimates();
  }, []);

  const filteredEstimates = useMemo(() => {
    const value = search.trim().toLowerCase();

    return estimates.filter((estimate) => {
      const matchesStatus =
        statusFilter === "ALL" || estimate.status === statusFilter;

      const matchesSearch =
        !value ||
        estimate.estimateNumber.toLowerCase().includes(value) ||
        estimate.eventName.toLowerCase().includes(value) ||
        estimate.client.name.toLowerCase().includes(value) ||
        estimate.client.email.toLowerCase().includes(value);

      return matchesStatus && matchesSearch;
    });
  }, [estimates, search, statusFilter]);

  const totalValue = estimates.reduce(
    (sum, estimate) => sum + Number(estimate.total || 0),
    0
  );

  const acceptedCount = estimates.filter(
    (estimate) => estimate.status === "ACCEPTED"
  ).length;

  const draftCount = estimates.filter(
    (estimate) => estimate.status === "DRAFT"
  ).length;

  const formatCurrency = (amount: number, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#29241f] sm:text-xl">
            Proposals & Estimates
          </h2>
          <p className="mt-0.5 text-xs text-[#756d64]">
            Review, approve, and convert client proposals into active events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/manager/booking")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#252525] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-95"
          >
            <CalendarPlus size={15} />
            Create Proposal
          </button>

          <button
            type="button"
            onClick={() => loadEstimates(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d8cfc4] bg-[#faf8f5] px-3.5 py-2 text-xs font-semibold text-[#29241f] hover:bg-[#eee8de] active:scale-95 transition disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {/* Total Estimates */}
        <div className="group rounded-2xl border border-[#e8e1d8] bg-[#faf8f5] p-4 transition hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0e4d3] text-[#9a6c37]">
              <FileText size={17} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#aaa097]">
              Total
            </span>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#29241f]">
            {estimates.length}
          </p>
          <p className="mt-0.5 text-xs font-medium text-[#756d64]">
            Total Proposals
          </p>
        </div>

        {/* Drafts */}
        <div className="group rounded-2xl border border-[#e8e1d8] bg-[#faf8f5] p-4 transition hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3eee7] text-[#756d64]">
              <FileEdit size={17} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#aaa097]">
              Draft
            </span>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#29241f]">
            {draftCount}
          </p>
          <p className="mt-0.5 text-xs font-medium text-[#756d64]">
            Draft Proposals
          </p>
        </div>

        {/* Accepted */}
        <div className="group rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 transition hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CircleCheck size={17} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Accepted
            </span>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#29241f]">
            {acceptedCount}
          </p>
          <p className="mt-0.5 text-xs font-medium text-[#756d64]">
            Accepted & Ready
          </p>
        </div>

        {/* Estimate Value */}
        <div className="group rounded-2xl border border-[#e4d5c2] bg-[#f7f0e7] p-4 transition hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ead9c2] text-[#9a6c37]">
              <Wallet size={17} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a6c37]">
              Pipeline Value
            </span>
          </div>
          <p className="mt-3 truncate text-xl font-black tracking-tight text-[#29241f]">
            {formatCurrency(totalValue)}
          </p>
          <p className="mt-0.5 text-xs font-medium text-[#756d64]">
            Total Proposal Value
          </p>
        </div>
      </div>

      {/* Error / Feedback alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load proposals</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        </div>
      )}

      {convertSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 size={18} className="shrink-0 text-green-600" />
          <p className="font-semibold">{convertSuccess}</p>
          <p className="text-xs text-green-600">Switching to Events view…</p>
        </div>
      )}

      {convertError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Conversion failed</p>
            <p className="mt-1 text-xs">{convertError}</p>
          </div>
        </div>
      )}

      {acceptError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="text-xs">{acceptError}</div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-[#e8e1d8] bg-[#f7f2eb] p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b938a]"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search proposals by number, event, or client name..."
              className="w-full rounded-xl border border-[#e4d8c8] bg-white px-4 py-2.5 pl-10 text-sm font-medium text-[#29241f] outline-none transition placeholder:text-[#aaa097] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/15"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-full lg:w-52">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "ALL" | EstimateStatus)
              }
              className="w-full appearance-none rounded-xl border border-[#e4d8c8] bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-[#51483f] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/15"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="VIEWED">Viewed</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9b938a]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="overflow-hidden rounded-3xl border border-[#e8e1d8] bg-[#faf8f5] shadow-2xs">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-white/70"
              />
            ))}
          </div>
        ) : filteredEstimates.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f3ede5]">
              <FileText size={20} className="text-[#9a6c37]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#29241f]">
              No proposals found
            </h3>
            <p className="mt-1 text-xs text-[#756d64]">
              Try adjusting your search criteria or create a new booking estimate.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] border-separate border-spacing-0">
                <thead>
                  <tr className="border-b-2 border-[#e5ddd3] bg-[#f3ede5]">
                    <th className="px-5 py-4 text-left text-xs font-bold tracking-tight text-[#51483f]">
                      Estimate #
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold tracking-tight text-[#51483f]">
                      Event Details
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold tracking-tight text-[#51483f]">
                      Client
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold tracking-tight text-[#51483f]">
                      Date
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-bold tracking-tight text-[#51483f]">
                      Amount
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-bold tracking-tight text-[#51483f]">
                      Status
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-bold tracking-tight text-[#51483f]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEstimates.map((estimate) => (
                    <tr
                      key={estimate._id}
                      className="group transition-colors hover:bg-white"
                    >
                      {/* Estimate */}
                      <td className="px-5 py-4">
                        <p className="inline-flex rounded-lg bg-[#f0e4d3] px-2.5 py-1 text-xs font-bold tracking-wide text-[#9a6c37]">
                          {estimate.estimateNumber}
                        </p>
                        <p className="mt-1.5 text-[11px] text-[#9b938a]">
                          {formatDate(estimate.createdAt)}
                        </p>
                      </td>

                      {/* Event */}
                      <td className="px-5 py-4">
                        <p className="max-w-[180px] truncate text-sm font-bold text-[#29241f]">
                          {estimate.eventName}
                        </p>
                        <p className="mt-0.5 text-xs capitalize text-[#9b938a]">
                          {estimate.eventType} · {estimate.guests} guests
                        </p>
                      </td>

                      {/* Client */}
                      <td className="px-5 py-4">
                        <p className="max-w-[170px] truncate text-sm font-semibold text-[#51483f]">
                          {estimate.client.name}
                        </p>
                        <p className="mt-0.5 max-w-[180px] truncate text-xs text-[#9b938a]">
                          {estimate.client.email || estimate.client.phone}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#f7f2eb] px-2.5 py-1.5 text-xs font-semibold text-[#51483f]">
                          <CalendarDays size={13} className="text-[#a7773f]" />
                          {formatDate(estimate.eventDate)}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm font-extrabold text-[#29241f]">
                          {formatCurrency(estimate.total, estimate.currency)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                            statusStyles[estimate.status]
                          }`}
                        >
                          {statusLabels[estimate.status]}
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
                              handleAccept(estimate._id, estimate.eventName)
                            }
                            className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                          >
                            {acceptingId === estimate._id ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                Accepting...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={13} />
                                Accept
                              </>
                            )}
                          </button>
                        )}

                        {estimate.status === "ACCEPTED" ? (
                          <button
                            type="button"
                            id={`convert-estimate-${estimate._id}`}
                            disabled={convertingId === estimate._id}
                            onClick={() =>
                              handleConvert(estimate._id, estimate.eventName)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                          >
                            {convertingId === estimate._id ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                Converting…
                              </>
                            ) : (
                              <>
                                <ArrowRight size={13} />
                                Convert to Event
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenStudio(estimate)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#29241F] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:bg-black transition active:scale-95"
                              title="Export Studio (PDF / Invoice)"
                            >
                              <Sparkles size={11} className="text-[#D4AF37]" />
                              <span>Export</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectEstimate(estimate)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#d8cfc4] bg-white px-2.5 py-1.5 text-xs font-medium text-[#29241f] transition hover:bg-[#f7f2eb]"
                            >
                              <Eye size={13} />
                              View
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 p-3 md:hidden">
              {filteredEstimates.map((estimate) => (
                <article
                  key={estimate._id}
                  className="overflow-hidden rounded-2xl border border-[#e8e1d8] bg-[#faf8f5] p-4 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex rounded-lg bg-[#f0e4d3] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#9a6c37]">
                        {estimate.estimateNumber}
                      </span>
                      <h3 className="mt-1.5 font-bold text-[#29241f]">
                        {estimate.eventName}
                      </h3>
                      <p className="text-xs text-[#756d64]">
                        {estimate.client.name}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        statusStyles[estimate.status]
                      }`}
                    >
                      {statusLabels[estimate.status]}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#e8e1d8] pt-3 text-xs">
                    <span className="text-[#756d64]">
                      {formatDate(estimate.eventDate)}
                    </span>
                    <span className="font-bold text-[#29241f]">
                      {formatCurrency(estimate.total, estimate.currency)}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {estimate.status === "ACCEPTED" ? (
                      <button
                        type="button"
                        disabled={convertingId === estimate._id}
                        onClick={() =>
                          handleConvert(estimate._id, estimate.eventName)
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs"
                      >
                        <ArrowRight size={13} />
                        Convert to Event
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenStudio(estimate)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#29241f] py-2 text-xs font-bold text-white"
                        >
                          <Sparkles size={12} className="text-[#d4af37]" />
                          Export
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectEstimate(estimate)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d8cfc4] bg-white py-2 text-xs font-semibold text-[#29241f]"
                        >
                          <Eye size={13} />
                          Details
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Estimate Modal Details */}
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#eee7dc] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#9a6c37]">
                  {selectedEstimate.estimateNumber}
                </p>
                <h2
                  id="estimate-details-title"
                  className="mt-1 text-xl font-black text-[#29241f]"
                >
                  {selectedEstimate.eventName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEstimate(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close estimate details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#faf8f5] border border-[#e8e1d8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#aaa097]">
                  Event Info
                </p>
                <p className="mt-1.5 text-sm font-bold text-[#29241f]">
                  {selectedEstimate.eventType} · {selectedEstimate.guests} guests
                </p>
                <p className="mt-1 text-xs text-[#756d64]">
                  {formatDate(selectedEstimate.eventDate)} at {selectedEstimate.eventTime}
                </p>
                <p className="mt-0.5 text-xs text-[#756d64]">
                  {selectedEstimate.location}
                </p>
              </div>

              <div className="rounded-2xl bg-[#faf8f5] border border-[#e8e1d8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#aaa097]">
                  Client Contact
                </p>
                <p className="mt-1.5 text-sm font-bold text-[#29241f]">
                  {selectedEstimate.client.name}
                </p>
                <p className="mt-1 break-all text-xs text-[#756d64]">
                  {selectedEstimate.client.email}
                </p>
                <p className="mt-0.5 text-xs text-[#756d64]">
                  {selectedEstimate.client.phone}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#e8e1d8] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#29241f]">Financial Summary</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    statusStyles[selectedEstimate.status]
                  }`}
                >
                  {statusLabels[selectedEstimate.status]}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#756d64]">
                {selectedEstimate.description || "No description provided."}
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-[#eee7dc] pt-3">
                <span className="text-xs text-[#756d64]">Total Proposed Amount</span>
                <span className="text-base font-extrabold text-[#29241f]">
                  {formatCurrency(selectedEstimate.total, selectedEstimate.currency)}
                </span>
              </div>
            </div>

            {/* Export Actions inside Modal */}
            <div className="mt-5 border-t border-[#eee7dc] pt-4">
              <p className="mb-2 text-xs font-bold text-[#29241f]">
                Export & Share Document
              </p>
              <EstimateExportActions
                estimateNumber={selectedEstimate.estimateNumber}
                eventName={selectedEstimate.eventName}
                clientName={selectedEstimate.client.name}
                clientPhone={selectedEstimate.client.phone}
                clientEmail={selectedEstimate.client.email}
                eventDate={selectedEstimate.eventDate}
                total={selectedEstimate.total}
                currency={selectedEstimate.currency}
                documentData={buildDocumentDataFromEstimate(selectedEstimate)}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedEstimate(null)}
                className="rounded-xl border border-[#d8cfc4] bg-[#faf8f5] px-4 py-2 text-xs font-bold text-[#29241f]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {studioDocData && (
        <ClientDocumentModal
          open={studioModalOpen}
          onClose={() => setStudioModalOpen(false)}
          documentData={studioDocData}
        />
      )}
    </div>
  );
}

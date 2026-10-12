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
  Clock,
  Eye,
  FileEdit,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Users,
  Wallet,
  X,
} from "lucide-react";

import Link from "next/link";
import {
  getEstimates,
  getEstimateById,
  updateEstimateStatus,
  convertEstimateToBooking,
} from "@/lib/estimates.api";
import { getEvents, type Event } from "@/lib/event.api";
import EstimateExportActions from "@/components/estimates/EstimateExportActions";
import ClientDocumentModal from "@/components/manager/documents/ClientDocumentModal";
import { formatTime24to12 } from "@/lib/time-utils";
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

  convertedToEvent?: boolean;
  convertedEventId?: string | null;
  convertedBookingId?: string | null;

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
      time: formatTime24to12(est.eventTime) || est.eventTime,
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
  const [events, setEvents] = useState<Event[]>([]);
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

  const getEstimateConversionInfo = (estimate: Estimate): { isConverted: boolean; eventId?: string } => {
    if (estimate.convertedToEvent && estimate.convertedEventId) {
      return { isConverted: true, eventId: estimate.convertedEventId };
    }
    if (estimate.convertedToEvent) {
      return { isConverted: true };
    }

    const estDateStr = estimate.eventDate ? new Date(estimate.eventDate).toISOString().slice(0, 10) : "";
    const estNameNorm = estimate.eventName ? estimate.eventName.trim().toLowerCase() : "";
    const estClientEmail = estimate.client?.email?.trim().toLowerCase();
    const estClientPhone = estimate.client?.phone?.trim();

    const matchedEvent = events.find((evt) => {
      if (estimate.convertedBookingId) {
        const bId = typeof evt.booking === "object" && evt.booking ? evt.booking._id : evt.booking;
        if (bId === estimate.convertedBookingId) return true;
      }

      const evtDateStr = evt.eventDate ? new Date(evt.eventDate).toISOString().slice(0, 10) : "";
      const evtNameNorm = evt.eventName ? evt.eventName.trim().toLowerCase() : "";

      if (estNameNorm && evtNameNorm && estNameNorm === evtNameNorm && estDateStr && evtDateStr && estDateStr === evtDateStr) {
        return true;
      }

      const evtClientEmail = typeof evt.client === "object" && evt.client ? evt.client.email?.trim().toLowerCase() : "";
      const evtClientPhone = typeof evt.client === "object" && evt.client ? evt.client.phone?.trim() : "";
      if (
        estDateStr &&
        evtDateStr &&
        estDateStr === evtDateStr &&
        ((estClientEmail && evtClientEmail && estClientEmail === evtClientEmail) ||
         (estClientPhone && evtClientPhone && estClientPhone === evtClientPhone))
      ) {
        return true;
      }

      return false;
    });

    if (matchedEvent) {
      return { isConverted: true, eventId: matchedEvent._id };
    }

    return { isConverted: false };
  };

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

      if (selectedEstimate && selectedEstimate._id === estimateId) {
        setSelectedEstimate((curr) =>
          curr ? { ...curr, status: "ACCEPTED" } : null
        );
      }
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
      const targetEstimate = estimates.find((e) => e._id === estimateId);
      if (targetEstimate && targetEstimate.status !== "ACCEPTED") {
        await updateEstimateStatus(estimateId, "ACCEPTED");
      }

      const result = await convertEstimateToBooking(estimateId);

      setConvertSuccess(`"${estimateName}" converted to event successfully.`);

      setEstimates((current) =>
        current.map((estimate) =>
          estimate._id === estimateId
            ? {
                ...estimate,
                status: "ACCEPTED",
                convertedToEvent: true,
                convertedEventId: result?.event?._id,
              }
            : estimate
        )
      );

      if (selectedEstimate && selectedEstimate._id === estimateId) {
        setSelectedEstimate((curr) =>
          curr
            ? {
                ...curr,
                status: "ACCEPTED",
                convertedToEvent: true,
                convertedEventId: result?.event?._id,
              }
            : null
        );
      }

      loadEstimates(true);

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
      const [result, eventsResult] = await Promise.allSettled([
        getEstimates(),
        getEvents({ limit: 100 }),
      ]);

      if (result.status === "fulfilled") {
        setEstimates(result.value.data || []);
      }
      if (eventsResult.status === "fulfilled" && eventsResult.value.data) {
        setEvents(eventsResult.value.data);
      }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#29241f] sm:text-xl">
            Proposals & Estimates
          </h2>
          <p className="mt-0.5 text-xs text-[#756d64]">
            Review, approve, and convert client proposals into active events.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">
          <button
            type="button"
            onClick={() => router.push("/manager/booking")}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#252525] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-[0.98]"
          >
            <CalendarPlus size={15} />
            <span>Create Proposal</span>
          </button>

          <button
            type="button"
            onClick={() => loadEstimates(true)}
            disabled={refreshing}
            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#d8cfc4] bg-[#faf8f5] px-3.5 py-2 text-xs font-semibold text-[#29241f] hover:bg-[#eee8de] active:scale-[0.98] transition disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {/* Total Estimates */}
        <div className="group rounded-2xl border border-[#e8e1d8] bg-[#faf8f5] p-3 sm:p-4 transition hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#f0e4d3] text-[#9a6c37]">
              <FileText size={16} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#aaa097]">
              Total
            </span>
          </div>
          <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-black tracking-tight text-[#29241f]">
            {estimates.length}
          </p>
          <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-[#756d64]">
            Total Proposals
          </p>
        </div>

        {/* Drafts */}
        <div className="group rounded-2xl border border-[#e8e1d8] bg-[#faf8f5] p-3 sm:p-4 transition hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#f3eee7] text-[#756d64]">
              <FileEdit size={16} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#aaa097]">
              Draft
            </span>
          </div>
          <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-black tracking-tight text-[#29241f]">
            {draftCount}
          </p>
          <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-[#756d64]">
            Draft Proposals
          </p>
        </div>

        {/* Accepted */}
        <div className="group rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3 sm:p-4 transition hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CircleCheck size={16} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Accepted
            </span>
          </div>
          <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-black tracking-tight text-[#29241f]">
            {acceptedCount}
          </p>
          <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-[#756d64]">
            Accepted & Ready
          </p>
        </div>

        {/* Estimate Value */}
        <div className="group rounded-2xl border border-[#e4d5c2] bg-[#f7f0e7] p-3 sm:p-4 transition hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#ead9c2] text-[#9a6c37]">
              <Wallet size={16} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#9a6c37]">
              Pipeline
            </span>
          </div>
          <p className="mt-2 sm:mt-3 truncate text-lg sm:text-xl font-black tracking-tight text-[#29241f]">
            {formatCurrency(totalValue)}
          </p>
          <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-[#756d64]">
            Total Value
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
          <div>
            <p className="font-semibold">{convertSuccess}</p>
            <p className="text-xs text-green-600">Switching to Events view…</p>
          </div>
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

      {/* Filters & Quick Chips */}
      <div className="rounded-2xl border border-[#e8e1d8] bg-[#f7f2eb] p-3 sm:p-4 space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
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
              placeholder="Search by number, event, or client..."
              className="w-full rounded-xl border border-[#e4d8c8] bg-white px-4 py-2.5 pl-10 pr-9 text-xs sm:text-sm font-medium text-[#29241f] outline-none transition placeholder:text-[#aaa097] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-52 shrink-0">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "ALL" | EstimateStatus)
              }
              className="w-full appearance-none rounded-xl border border-[#e4d8c8] bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-[#51483f] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/15"
            >
              <option value="ALL">All Statuses ({estimates.length})</option>
              <option value="ACCEPTED">Accepted ({acceptedCount})</option>
              <option value="DRAFT">Draft ({draftCount})</option>
              <option value="SENT">Sent ({estimates.filter((e) => e.status === "SENT").length})</option>
              <option value="VIEWED">Viewed ({estimates.filter((e) => e.status === "VIEWED").length})</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9b938a]">
              <svg
                width="15"
                height="15"
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

        {/* Quick Filter Chips (Touch-friendly horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 pt-0.5">
          {[
            { label: "All", value: "ALL" as const, count: estimates.length },
            { label: "Accepted", value: "ACCEPTED" as const, count: acceptedCount },
            { label: "Draft", value: "DRAFT" as const, count: draftCount },
            {
              label: "Sent",
              value: "SENT" as const,
              count: estimates.filter((e) => e.status === "SENT").length,
            },
            {
              label: "Viewed",
              value: "VIEWED" as const,
              count: estimates.filter((e) => e.status === "VIEWED").length,
            },
          ].map((qf) => {
            const active = statusFilter === qf.value;
            return (
              <button
                key={qf.value}
                type="button"
                onClick={() => setStatusFilter(qf.value)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                  active
                    ? "bg-[#29241f] text-white shadow-xs"
                    : "border border-[#e0d6cb] bg-white text-[#6b6257] hover:bg-[#ede5da]"
                }`}
              >
                <span>{qf.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    active ? "bg-white/20 text-white" : "bg-[#f2ece3] text-[#786e63]"
                  }`}
                >
                  {qf.count}
                </span>
              </button>
            );
          })}
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
                        {(() => {
                          const conversion = getEstimateConversionInfo(estimate);

                          if (conversion.isConverted) {
                            return (
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                  <CheckCircle2 size={13} className="text-emerald-600" />
                                  Converted
                                </span>
                                {conversion.eventId && (
                                  <Link
                                    href={`/manager/events/${conversion.eventId}`}
                                    className="inline-flex items-center gap-1 rounded-lg bg-[#29241f] px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-black"
                                    title="View live event"
                                  >
                                    View Event
                                    <ArrowRight size={12} />
                                  </Link>
                                )}
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
                            );
                          }

                          return (
                            <div className="flex items-center justify-end gap-1.5">
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
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
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

                              <button
                                type="button"
                                id={`convert-estimate-${estimate._id}`}
                                disabled={convertingId === estimate._id || Boolean(acceptingId)}
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
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (Optimized for touch, clean reading & fast actions) */}
            <div className="space-y-3.5 p-3 md:hidden">
              {filteredEstimates.map((estimate) => {
                const conversion = getEstimateConversionInfo(estimate);

                return (
                  <article
                    key={estimate._id}
                    className="overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:border-[#cfc1b0]"
                  >
                    {/* Card Header: Estimate Number & Status */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#f1eae0] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-lg bg-[#f0e4d3] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#9a6c37]">
                          {estimate.estimateNumber}
                        </span>
                        <span className="text-[11px] text-[#9b938a]">
                          {formatDate(estimate.createdAt)}
                        </span>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          statusStyles[estimate.status]
                        }`}
                      >
                        {statusLabels[estimate.status]}
                      </span>
                    </div>

                    {/* Event Title & Meta Badges */}
                    <div className="mt-3">
                      <h3 className="text-base font-extrabold text-[#29241f]">
                        {estimate.eventName}
                      </h3>

                      {/* Meta Tags: Type, Guests, Location, Time */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#faf8f5] border border-[#e8e1d8] px-2 py-0.5 font-semibold text-[#51483f] capitalize">
                          <Tag size={11} className="text-[#a7773f]" />
                          {estimate.eventType}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-md bg-[#faf8f5] border border-[#e8e1d8] px-2 py-0.5 font-semibold text-[#51483f]">
                          <Users size={11} className="text-[#a7773f]" />
                          {estimate.guests} guests
                        </span>

                        {estimate.location && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#faf8f5] border border-[#e8e1d8] px-2 py-0.5 font-semibold text-[#51483f] max-w-[190px] truncate">
                            <MapPin size={11} className="text-[#a7773f] shrink-0" />
                            <span className="truncate">{estimate.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Date & Time pill */}
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#6e6459]">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <CalendarDays size={13} className="text-[#a7773f]" />
                          {formatDate(estimate.eventDate)}
                        </span>
                        {estimate.eventTime && (
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Clock size={13} className="text-[#a7773f]" />
                            {formatTime24to12(estimate.eventTime) || estimate.eventTime}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Client Information with 1-tap call & email */}
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-[#faf8f5] border border-[#eee7dc] p-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#29241f]">
                          {estimate.client.name}
                        </p>
                        <p className="truncate text-[11px] text-[#8c8276]">
                          {estimate.client.phone || estimate.client.email || "No contact info"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {estimate.client.phone && (
                          <a
                            href={`tel:${estimate.client.phone}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#d8cfc4] text-[#29241f] shadow-2xs hover:bg-[#eee8de] transition active:scale-95"
                            title="Call client"
                          >
                            <Phone size={13} />
                          </a>
                        )}
                        {estimate.client.email && (
                          <a
                            href={`mailto:${estimate.client.email}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#d8cfc4] text-[#29241f] shadow-2xs hover:bg-[#eee8de] transition active:scale-95"
                            title="Email client"
                          >
                            <Mail size={13} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="mt-3 flex items-baseline justify-between border-t border-[#f1eae0] pt-2.5">
                      <span className="text-xs font-medium text-[#756d64]">
                        Total Proposed Amount
                      </span>
                      <span className="text-base font-black text-[#29241f]">
                        {formatCurrency(estimate.total, estimate.currency)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 pt-1 space-y-2">
                      {conversion.isConverted ? (
                        <>
                          <div className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                            <span className="inline-flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              Converted to Live Event
                            </span>
                            {conversion.eventId && (
                              <Link
                                href={`/manager/events/${conversion.eventId}`}
                                className="inline-flex items-center gap-1 font-bold text-emerald-900 underline hover:text-black"
                              >
                                View <ArrowRight size={12} />
                              </Link>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenStudio(estimate)}
                              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[#29241f] py-2 text-xs font-bold text-white shadow-2xs hover:bg-black transition active:scale-95"
                            >
                              <Sparkles size={13} className="text-[#d4af37]" />
                              Export PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectEstimate(estimate)}
                              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#d8cfc4] bg-[#faf8f5] py-2 text-xs font-bold text-[#29241f] transition hover:bg-[#eee8de] active:scale-95"
                            >
                              <Eye size={14} />
                              Details
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Primary full-width Convert to Event button */}
                          <button
                            type="button"
                            id={`mobile-convert-${estimate._id}`}
                            disabled={convertingId === estimate._id || Boolean(acceptingId)}
                            onClick={() =>
                              handleConvert(estimate._id, estimate.eventName)
                            }
                            className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                          >
                            {convertingId === estimate._id ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Converting to Event…
                              </>
                            ) : (
                              <>
                                <ArrowRight size={14} />
                                Convert to Event
                              </>
                            )}
                          </button>

                          {/* Secondary options row */}
                          <div
                            className={`grid gap-2 ${
                              estimate.status === "DRAFT" ||
                              estimate.status === "SENT" ||
                              estimate.status === "VIEWED"
                                ? "grid-cols-3"
                                : "grid-cols-2"
                            }`}
                          >
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
                                className="inline-flex min-h-[38px] items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50 active:scale-95"
                              >
                                {acceptingId === estimate._id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={13} />
                                )}
                                <span>Accept</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenStudio(estimate)}
                              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-[#29241f] py-2 text-xs font-bold text-white shadow-2xs hover:bg-black transition active:scale-95"
                            >
                              <Sparkles size={12} className="text-[#d4af37]" />
                              <span>Export</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectEstimate(estimate)}
                              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-[#d8cfc4] bg-[#faf8f5] py-2 text-xs font-bold text-[#29241f] transition hover:bg-[#eee8de] active:scale-95"
                            >
                              <Eye size={13} />
                              <span>Details</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Estimate Modal Details */}
      {selectedEstimate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="estimate-details-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEstimate(null);
            }
          }}
        >
          <div className="max-h-[92vh] sm:max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#eee7dc] pb-3 sm:pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#9a6c37]">
                  {selectedEstimate.estimateNumber}
                </p>
                <h2
                  id="estimate-details-title"
                  className="mt-0.5 text-lg sm:text-xl font-black text-[#29241f]"
                >
                  {selectedEstimate.eventName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEstimate(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                aria-label="Close estimate details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 sm:mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#faf8f5] border border-[#e8e1d8] p-3.5 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#aaa097]">
                  Event Info
                </p>
                <p className="mt-1.5 text-sm font-bold text-[#29241f]">
                  {selectedEstimate.eventType} · {selectedEstimate.guests} guests
                </p>
                <p className="mt-1 text-xs text-[#756d64]">
                  {formatDate(selectedEstimate.eventDate)} at {formatTime24to12(selectedEstimate.eventTime) || selectedEstimate.eventTime}
                </p>
                <p className="mt-0.5 text-xs text-[#756d64]">
                  {selectedEstimate.location || "Location not specified"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#faf8f5] border border-[#e8e1d8] p-3.5 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#aaa097]">
                  Client Contact
                </p>
                <p className="mt-1.5 text-sm font-bold text-[#29241f]">
                  {selectedEstimate.client.name}
                </p>
                {selectedEstimate.client.email && (
                  <p className="mt-1 break-all text-xs text-[#756d64]">
                    <a
                      href={`mailto:${selectedEstimate.client.email}`}
                      className="hover:underline hover:text-black font-medium"
                    >
                      {selectedEstimate.client.email}
                    </a>
                  </p>
                )}
                {selectedEstimate.client.phone && (
                  <p className="mt-0.5 text-xs text-[#756d64]">
                    <a
                      href={`tel:${selectedEstimate.client.phone}`}
                      className="hover:underline hover:text-black font-medium"
                    >
                      {selectedEstimate.client.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3.5 sm:mt-4 rounded-2xl border border-[#e8e1d8] p-3.5 sm:p-4">
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
            <div className="mt-4 sm:mt-5 border-t border-[#eee7dc] pt-3.5 sm:pt-4">
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

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#eee7dc] pt-4">
              {(() => {
                const conversion = getEstimateConversionInfo(selectedEstimate);

                if (conversion.isConverted) {
                  return (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <span className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        Converted to Live Event
                      </span>
                      {conversion.eventId && (
                        <Link
                          href={`/manager/events/${conversion.eventId}`}
                          className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#29241f] px-4 py-2.5 text-xs font-bold text-white hover:bg-black transition active:scale-[0.98]"
                        >
                          <span>View Converted Event</span>
                          <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={convertingId === selectedEstimate._id || Boolean(acceptingId)}
                      onClick={() => handleConvert(selectedEstimate._id, selectedEstimate.eventName)}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-105 transition disabled:opacity-50 active:scale-[0.98]"
                    >
                      {convertingId === selectedEstimate._id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Converting to Event...
                        </>
                      ) : (
                        <>
                          <ArrowRight size={14} />
                          Convert to Event
                        </>
                      )}
                    </button>

                    {(selectedEstimate.status === "DRAFT" ||
                      selectedEstimate.status === "SENT" ||
                      selectedEstimate.status === "VIEWED") && (
                      <button
                        type="button"
                        disabled={acceptingId === selectedEstimate._id || Boolean(convertingId)}
                        onClick={() => handleAccept(selectedEstimate._id, selectedEstimate.eventName)}
                        className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50 active:scale-[0.98]"
                      >
                        {acceptingId === selectedEstimate._id ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} />
                            Accept Proposal
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={() => setSelectedEstimate(null)}
                className="w-full sm:w-auto min-h-[40px] rounded-xl border border-[#d8cfc4] bg-[#faf8f5] px-4 py-2.5 text-xs font-bold text-[#29241f] hover:bg-[#ede6dc] transition active:scale-[0.98]"
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

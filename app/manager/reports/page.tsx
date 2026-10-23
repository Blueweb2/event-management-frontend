"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  TrendingUp,
  Wallet,
  Users,
  Clock,
  Phone,
  Mail,
  MapPin,
  Search,
  UserCheck,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { getEvents, type Event } from "@/lib/event.api";
import { getEstimates, type Estimate, type EstimateStatus } from "@/lib/estimates.api";
import { getExpenses } from "@/lib/expense.api";
import type { Expense } from "@/components/manager/expenses/constants";
import { useReports } from "@/hooks/useReports";
import { useAuth } from "@/hooks/useAuth";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value: string) => {
  if (!value) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return value;
  }
};

interface ClientContactInfo {
  name: string;
  phone: string;
  email: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  fullLocation: string;
}

const extractEventClientDetails = (event: Event): ClientContactInfo => {
  const clientObj =
    typeof event.client === "object" && event.client !== null ? event.client : null;
  const bookingObj =
    typeof event.booking === "object" && event.booking !== null ? event.booking : null;
  const bookingClient =
    bookingObj && typeof (bookingObj as unknown as { client?: unknown }).client === "object"
      ? ((bookingObj as unknown as { client: Record<string, unknown> }).client as Record<string, unknown>)
      : null;

  const rawBooking = bookingObj as unknown as Record<string, unknown> | null;

  const name =
    clientObj?.name ||
    (typeof bookingClient?.name === "string" ? bookingClient.name : "") ||
    (typeof rawBooking?.name === "string" ? rawBooking.name : "") ||
    "N/A";

  const phone =
    clientObj?.phone ||
    (typeof bookingClient?.phone === "string" ? bookingClient.phone : "") ||
    (typeof rawBooking?.phone === "string" ? rawBooking.phone : "") ||
    "N/A";

  const email =
    clientObj?.email ||
    (typeof bookingClient?.email === "string" ? bookingClient.email : "") ||
    (typeof rawBooking?.email === "string" ? rawBooking.email : "") ||
    "N/A";

  const alternatePhone =
    clientObj?.alternatePhone ||
    (typeof bookingClient?.alternatePhone === "string" ? bookingClient.alternatePhone : "");

  const city =
    clientObj?.city ||
    (typeof bookingClient?.city === "string" ? bookingClient.city : "");

  const address =
    clientObj?.address ||
    (typeof bookingClient?.address === "string" ? bookingClient.address : "");

  const fullLocation =
    [address, city].filter(Boolean).join(", ") || city || address || event.location || "N/A";

  return {
    name,
    phone,
    email,
    alternatePhone,
    address,
    city,
    fullLocation,
  };
};

export default function ReportsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "clients">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { token } = useAuth();
  const { analytics, fetchAnalytics } = useReports({ token, autoFetch: true });

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const [eventResult, estimateResult, expenseResult] = await Promise.all([
        getEvents({ page: 1, limit: 200 }),
        getEstimates({ page: 1, limit: 200 }),
        getExpenses(),
      ]);
      setEvents(eventResult.data || []);
      setEstimates(estimateResult.data || []);
      setExpenses(expenseResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await loadReports();
    if (token) fetchAnalytics();
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadReports(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const inRange = useCallback(
    (value: string) => {
      if (!value) return true;
      const date = value.slice(0, 10);
      return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    },
    [fromDate, toDate]
  );

  const filteredEvents = useMemo(
    () => events.filter((event) => inRange(event.eventDate)),
    [events, inRange]
  );
  const filteredEstimates = useMemo(
    () => estimates.filter((estimate) => inRange(estimate.eventDate)),
    [estimates, inRange]
  );
  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => inRange(expense.date)),
    [expenses, inRange]
  );

  const metrics = useMemo(() => {
    const revenue = filteredEvents.reduce((sum, event) => {
      const booking = typeof event.booking === "object" ? event.booking : null;
      return sum + Number(booking?.total || 0);
    }, 0);
    const spending = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const guests = filteredEvents.reduce((sum, event) => sum + event.guests, 0);
    const pendingEstimates = filteredEstimates.filter((estimate) =>
      ["DRAFT", "SENT", "VIEWED"].includes(estimate.status)
    ).length;
    return { revenue, spending, guests, pendingEstimates, profit: revenue - spending };
  }, [filteredEvents, filteredExpenses, filteredEstimates]);

  const eventStatus = useMemo(() => {
    const statuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"] as const;
    return statuses.map((status) => ({
      status,
      count: filteredEvents.filter((event) => event.status === status).length,
    }));
  }, [filteredEvents]);

  const estimateStatus = useMemo(() => {
    const statuses: EstimateStatus[] = [
      "DRAFT",
      "SENT",
      "VIEWED",
      "ACCEPTED",
      "REJECTED",
      "EXPIRED",
      "CANCELLED",
    ];
    return statuses.map((status) => ({
      status,
      count: filteredEstimates.filter((estimate) => estimate.status === status).length,
    }));
  }, [filteredEstimates]);

  // Comprehensive CSV export with client details
  const exportReport = (formatType: "all" | "clients" = "all") => {
    let rows: string[][] = [];

    if (formatType === "clients") {
      rows = [
        [
          "Event Name",
          "Event Date",
          "Event Status",
          "Location / Venue",
          "Guest Count",
          "Client Name",
          "Client Phone",
          "Client Email",
          "Alternate Phone",
          "Client Address / City",
          "Total Revenue (INR)",
          "Paid Amount (INR)",
          "Payment Status",
        ],
        ...filteredEvents.map((event) => {
          const client = extractEventClientDetails(event);
          const booking = typeof event.booking === "object" ? event.booking : null;
          const total = Number(booking?.total || 0);
          const paid = Number(booking?.paidAmount || booking?.advancePayment || 0);
          const paymentStatus =
            booking?.paymentStatus ||
            (paid >= total && total > 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID");

          return [
            event.eventName,
            event.eventDate ? event.eventDate.slice(0, 10) : "",
            event.status,
            event.location || (booking as unknown as { location?: string })?.location || "",
            String(event.guests || 0),
            client.name,
            client.phone,
            client.email,
            client.alternatePhone || "",
            client.fullLocation,
            String(total),
            String(paid),
            paymentStatus,
          ];
        }),
      ];
    } else {
      rows = [
        [
          "Type",
          "Date",
          "Name / Item",
          "Status",
          "Amount (INR)",
          "Paid (INR)",
          "Payment Status",
          "Guests",
          "Client Name",
          "Client Phone",
          "Client Email",
          "Client Address / City",
          "Venue / Location",
        ],
        ...filteredEvents.map((event) => {
          const client = extractEventClientDetails(event);
          const booking = typeof event.booking === "object" ? event.booking : null;
          const total = Number(booking?.total || 0);
          const paid = Number(booking?.paidAmount || booking?.advancePayment || 0);
          const paymentStatus =
            booking?.paymentStatus ||
            (paid >= total && total > 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID");

          return [
            "Event",
            event.eventDate ? event.eventDate.slice(0, 10) : "",
            event.eventName,
            event.status,
            String(total),
            String(paid),
            paymentStatus,
            String(event.guests || 0),
            client.name,
            client.phone,
            client.email,
            client.fullLocation,
            event.location || (booking as unknown as { location?: string })?.location || "",
          ];
        }),
        ...filteredEstimates.map((estimate) => [
          "Estimate",
          estimate.eventDate ? estimate.eventDate.slice(0, 10) : "",
          `${estimate.estimateNumber || "EST"} - ${estimate.eventName}`,
          estimate.status,
          String(estimate.total || 0),
          "0",
          "PENDING",
          String(estimate.guests || 0),
          estimate.client?.name || "",
          estimate.client?.phone || "",
          estimate.client?.email || "",
          "",
          estimate.location || "",
        ]),
        ...filteredExpenses.map((expense) => [
          "Expense",
          expense.date ? expense.date.slice(0, 10) : "",
          expense.title,
          expense.status,
          String(expense.amount || 0),
          String(expense.amount || 0),
          "PAID",
          "",
          "",
          "",
          "",
          "",
          expense.category || "",
        ]),
      ];
    }

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      formatType === "clients"
        ? `client-directory-report-${new Date().toISOString().slice(0, 10)}.csv`
        : `event-management-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clientEventsList = useMemo(() => {
    return filteredEvents
      .map((event) => {
        const client = extractEventClientDetails(event);
        const booking = typeof event.booking === "object" ? event.booking : null;
        const total = Number(booking?.total || 0);
        const paid = Number(booking?.paidAmount || booking?.advancePayment || 0);
        const paymentStatus =
          booking?.paymentStatus ||
          (paid >= total && total > 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID");

        return {
          event,
          client,
          total,
          paid,
          paymentStatus,
        };
      })
      .filter((item) => {
        if (!clientSearch.trim()) return true;
        const q = clientSearch.toLowerCase().trim();
        return (
          item.client.name.toLowerCase().includes(q) ||
          item.client.phone.toLowerCase().includes(q) ||
          item.client.email.toLowerCase().includes(q) ||
          item.event.eventName.toLowerCase().includes(q) ||
          item.event.location.toLowerCase().includes(q)
        );
      });
  }, [filteredEvents, clientSearch]);

  return (
    <main className="space-y-6">
      <PageHeader
        title="Reports"
        description="Understand event performance, estimate pipeline, guest analytics, and client details."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void refreshAll()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ded5cb] bg-white px-4 py-2.5 text-sm font-semibold text-[#403a34] hover:bg-[#f8f4ee] disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => exportReport("all")}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6B5B95] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#57487e] disabled:opacity-50"
              title="Export comprehensive report including events, clients, estimates, and expenses"
            >
              <Download size={16} />
              Export CSV (with Clients)
            </button>
            <button
              type="button"
              onClick={() => exportReport("clients")}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#6B5B95] bg-[#F1EDF8] px-4 py-2.5 text-sm font-semibold text-[#6B5B95] hover:bg-[#e4dcf1] disabled:opacity-50"
              title="Export dedicated Client Directory with full contact info and booking revenue"
            >
              <Users size={16} />
              Client Directory CSV
            </button>
          </div>
        }
      />

      {/* Date filters and View Tabs */}
      <section className="flex flex-col gap-4 rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600">From date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:border-[#6B5B95] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600">To date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:border-[#6B5B95] focus:outline-none"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="h-10 px-2 text-xs font-semibold text-[#6B5B95] hover:underline"
            >
              Clear dates
            </button>
          )}
        </div>

        {/* View toggles */}
        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/80 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "overview"
                ? "bg-white text-[#6B5B95] shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Overview & Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "clients"
                ? "bg-white text-[#6B5B95] shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Users size={14} />
            Client Directory ({filteredEvents.length})
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white">
          <Loader2 className="animate-spin text-[#6B5B95]" />
        </div>
      ) : (
        <>
          {/* Top Summary Metrics */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <Metric
              icon={<TrendingUp size={19} />}
              label="Event revenue"
              value={formatCurrency(metrics.revenue)}
            />
            <Metric
              icon={<Wallet size={19} />}
              label="Recorded spending"
              value={formatCurrency(metrics.spending)}
              tone="gold"
            />
            <Metric
              icon={<BarChart3 size={19} />}
              label="Estimated margin"
              value={formatCurrency(metrics.profit)}
              tone={metrics.profit >= 0 ? "green" : "red"}
            />
            <Metric
              icon={<Users size={19} />}
              label="Event guests"
              value={metrics.guests.toLocaleString("en-IN")}
              tone="purple"
            />
            <Metric
              icon={<FileText size={19} />}
              label="Open estimates"
              value={String(metrics.pendingEstimates)}
              tone="blue"
            />
            <Metric
              icon={<Clock size={19} />}
              label="Staff Hours"
              value={analytics ? `${analytics.totalStaffHours}h` : "0h"}
              tone="gold"
            />
          </section>

          {activeTab === "overview" ? (
            <>
              {/* Status and Pipeline bars */}
              <section className="grid gap-6 xl:grid-cols-2">
                <ReportPanel title="Event status" icon={<CalendarDays size={18} />}>
                  <Bars
                    items={eventStatus.map((item) => ({
                      label: item.status,
                      value: item.count,
                    }))}
                    color="bg-[#6B5B95]"
                  />
                </ReportPanel>
                <ReportPanel title="Estimate pipeline" icon={<FileText size={18} />}>
                  <Bars
                    items={estimateStatus.map((item) => ({
                      label: item.status,
                      value: item.count,
                    }))}
                    color="bg-[#b8894b]"
                  />
                </ReportPanel>
              </section>

              {/* Recent Activity with Client Details */}
              <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#29241f]">
                      Recent activity & Clients
                    </h2>
                    <p className="mt-1 text-xs text-[#9b938a]">
                      Events, client contacts, and expenses in the selected period.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#9b938a]">
                    {filteredEvents.length + filteredExpenses.length} records
                  </span>
                </div>

                <div className="mt-4 divide-y divide-[#eee8e1]">
                  {[
                    ...filteredEvents.map((event) => {
                      const client = extractEventClientDetails(event);
                      return {
                        date: event.eventDate,
                        name: event.eventName,
                        type: "Event",
                        status: event.status,
                        amount:
                          typeof event.booking === "object" ? event.booking.total || 0 : 0,
                        clientName: client.name,
                        clientPhone: client.phone,
                        clientEmail: client.email,
                        location: event.location,
                      };
                    }),
                    ...filteredExpenses.map((expense) => ({
                      date: expense.date,
                      name: expense.title,
                      type: "Expense",
                      status: expense.status,
                      amount: expense.amount,
                      clientName: "",
                      clientPhone: "",
                      clientEmail: "",
                      location: expense.category,
                    })),
                  ]
                    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                    .slice(0, 10)
                    .map((item) => (
                      <div
                        key={`${item.type}-${item.date}-${item.name}`}
                        className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                item.type === "Expense"
                                  ? "bg-[#F4EBDD] text-[#9A7B4F]"
                                  : "bg-[#F1EDF8] text-[#6B5B95]"
                              }`}
                            >
                              {item.type}
                            </span>
                            <p className="truncate text-sm font-semibold text-[#403a34]">
                              {item.name}
                            </p>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9b938a]">
                            <span>{formatDate(item.date)}</span>
                            {item.clientName && item.clientName !== "N/A" && (
                              <span className="flex items-center gap-1 font-medium text-[#403a34]">
                                <UserCheck size={13} className="text-[#6B5B95]" />
                                Client: {item.clientName}
                                {item.clientPhone && item.clientPhone !== "N/A" && (
                                  <span className="text-[#7d756d]">({item.clientPhone})</span>
                                )}
                              </span>
                            )}
                            {item.location && <span>· 📍 {item.location}</span>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                          <p
                            className={`text-sm font-bold ${
                              item.type === "Expense" ? "text-[#a7773f]" : "text-[#557555]"
                            }`}
                          >
                            {item.type === "Expense" ? "-" : ""}
                            {formatCurrency(item.amount)}
                          </p>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            </>
          ) : (
            /* Dedicated Client Directory & Booking Details Table */
            <section className="space-y-4 rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#29241f]">
                    Client Directory & Booking Reports
                  </h2>
                  <p className="mt-0.5 text-xs text-[#9b938a]">
                    Showing client contact info, address, event details, and payment status.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search client, phone, event..."
                    className="h-9 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-xs focus:border-[#6B5B95] focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#eee8e1]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#eee8e1] bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Client Details</th>
                      <th className="px-4 py-3">Event & Date</th>
                      <th className="px-4 py-3">Venue / Location</th>
                      <th className="px-4 py-3">Guests</th>
                      <th className="px-4 py-3">Total (₹)</th>
                      <th className="px-4 py-3">Paid (₹)</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee8e1]">
                    {clientEventsList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
                          No matching client records found.
                        </td>
                      </tr>
                    ) : (
                      clientEventsList.map(({ event, client, total, paid, paymentStatus }) => (
                        <tr
                          key={event._id}
                          className="hover:bg-[#faf8f5] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[#29241f]">{client.name}</p>
                            <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-gray-500">
                              {client.phone && client.phone !== "N/A" && (
                                <span className="flex items-center gap-1">
                                  <Phone size={10} className="text-[#6B5B95]" />
                                  {client.phone}
                                </span>
                              )}
                              {client.email && client.email !== "N/A" && (
                                <span className="flex items-center gap-1">
                                  <Mail size={10} className="text-[#6B5B95]" />
                                  {client.email}
                                </span>
                              )}
                              {client.address && (
                                <span className="flex items-center gap-1 text-gray-400">
                                  <MapPin size={10} />
                                  {client.address}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#403a34]">{event.eventName}</p>
                            <p className="mt-0.5 text-[11px] text-gray-500">
                              {formatDate(event.eventDate)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {event.location || "N/A"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-700">
                            {event.guests}
                          </td>
                          <td className="px-4 py-3 font-bold text-[#557555]">
                            {formatCurrency(total)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-700">
                            {formatCurrency(paid)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                paymentStatus === "PAID"
                                  ? "bg-green-50 text-green-700"
                                  : paymentStatus === "PARTIAL"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                              {event.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  tone = "purple",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "purple" | "gold" | "green" | "red" | "blue";
}) {
  const styles = {
    purple: "bg-[#F1EDF8] text-[#6B5B95]",
    gold: "bg-[#F4EBDD] text-[#9A7B4F]",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <article className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[tone]}`}>
        {icon}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-[#29241f]">{value}</p>
    </article>
  );
}

function ReportPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2 text-[#6B5B95]">
        <span>{icon}</span>
        <h2 className="text-lg font-semibold text-[#29241f]">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Bars({
  items,
  color,
}: {
  items: { label: string; value: number }[];
  color: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[90px_1fr_28px] items-center gap-3 text-xs"
        >
          <span className="truncate font-medium text-gray-600">{item.label}</span>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="text-right font-bold text-gray-700">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

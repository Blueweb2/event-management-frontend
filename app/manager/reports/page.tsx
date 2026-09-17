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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));

export default function ReportsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { token } = useAuth();
  const { analytics, fetchAnalytics } = useReports({ token, autoFetch: true });

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const [eventResult, estimateResult, expenseResult] = await Promise.all([
        getEvents({ page: 1, limit: 100 }),
        getEstimates({ page: 1, limit: 100 }),
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
    loadReports();
    if (token) fetchAnalytics();
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadReports(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const inRange = useCallback((value: string) => {
    const date = value.slice(0, 10);
    return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
  }, [fromDate, toDate]);

  const filteredEvents = useMemo(() => events.filter((event) => inRange(event.eventDate)), [events, inRange]);
  const filteredEstimates = useMemo(() => estimates.filter((estimate) => inRange(estimate.eventDate)), [estimates, inRange]);
  const filteredExpenses = useMemo(() => expenses.filter((expense) => inRange(expense.date)), [expenses, inRange]);

  const metrics = useMemo(() => {
    const revenue = filteredEvents.reduce((sum, event) => {
      const booking = typeof event.booking === "object" ? event.booking : null;
      return sum + Number(booking?.total || 0);
    }, 0);
    const spending = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const guests = filteredEvents.reduce((sum, event) => sum + event.guests, 0);
    const pendingEstimates = filteredEstimates.filter((estimate) => ["DRAFT", "SENT", "VIEWED"].includes(estimate.status)).length;
    return { revenue, spending, guests, pendingEstimates, profit: revenue - spending };
  }, [filteredEvents, filteredExpenses, filteredEstimates]);

  const eventStatus = useMemo(() => {
    const statuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"] as const;
    return statuses.map((status) => ({ status, count: filteredEvents.filter((event) => event.status === status).length }));
  }, [filteredEvents]);

  const estimateStatus = useMemo(() => {
    const statuses: EstimateStatus[] = ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"];
    return statuses.map((status) => ({ status, count: filteredEstimates.filter((estimate) => estimate.status === status).length }));
  }, [filteredEstimates]);

  const exportReport = () => {
    const rows = [
      ["Report", "Date", "Name", "Status", "Amount", "Guests"],
      ...filteredEvents.map((event) => ["Event", event.eventDate, event.eventName, event.status, String(typeof event.booking === "object" ? event.booking.total || 0 : 0), String(event.guests)]),
      ...filteredExpenses.map((expense) => ["Expense", expense.date, expense.title, expense.status, String(expense.amount), ""]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "event-management-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-6">
      <PageHeader
        title="Reports"
        description="Understand event performance, estimate pipeline, guests, and spending."
        action={<div className="flex gap-2"><button type="button" onClick={() => void refreshAll()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#ded5cb] bg-white px-4 py-2.5 text-sm font-semibold text-[#403a34] hover:bg-[#f8f4ee] disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Refresh</button><button type="button" onClick={exportReport} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#6B5B95] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#57487e] disabled:opacity-50"><Download size={16} />Export CSV</button></div>}
      />

      <section className="flex flex-col gap-3 rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div><label className="block text-xs font-semibold text-gray-600">From date</label><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="mt-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:border-[#6B5B95] focus:outline-none" /></div>
        <div><label className="block text-xs font-semibold text-gray-600">To date</label><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="mt-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:border-[#6B5B95] focus:outline-none" /></div>
        {(fromDate || toDate) && <button type="button" onClick={() => { setFromDate(""); setToDate(""); }} className="h-10 px-2 text-xs font-semibold text-[#6B5B95]">Clear dates</button>}
      </section>

      {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {loading ? <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white"><Loader2 className="animate-spin text-[#6B5B95]" /></div> : <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <Metric icon={<TrendingUp size={19} />} label="Event revenue" value={formatCurrency(metrics.revenue)} />
          <Metric icon={<Wallet size={19} />} label="Recorded spending" value={formatCurrency(metrics.spending)} tone="gold" />
          <Metric icon={<BarChart3 size={19} />} label="Estimated margin" value={formatCurrency(metrics.profit)} tone={metrics.profit >= 0 ? "green" : "red"} />
          <Metric icon={<Users size={19} />} label="Event guests" value={metrics.guests.toLocaleString("en-IN")} tone="purple" />
          <Metric icon={<FileText size={19} />} label="Open estimates" value={String(metrics.pendingEstimates)} tone="blue" />
          <Metric icon={<Clock size={19} />} label="Staff Hours" value={analytics ? `${analytics.totalStaffHours}h` : "0h"} tone="gold" />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ReportPanel title="Event status" icon={<CalendarDays size={18} />}><Bars items={eventStatus.map((item) => ({ label: item.status, value: item.count }))} color="bg-[#6B5B95]" /></ReportPanel>
          <ReportPanel title="Estimate pipeline" icon={<FileText size={18} />}><Bars items={estimateStatus.map((item) => ({ label: item.status, value: item.count }))} color="bg-[#b8894b]" /></ReportPanel>
        </section>

        <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-[#29241f]">Recent activity</h2><p className="mt-1 text-xs text-[#9b938a]">Events and expenses in the selected period.</p></div><span className="text-xs font-medium text-[#9b938a]">{filteredEvents.length + filteredExpenses.length} records</span></div><div className="mt-4 divide-y divide-[#eee8e1]">{[...filteredEvents.map((event) => ({ date: event.eventDate, name: event.eventName, type: "Event", status: event.status, amount: typeof event.booking === "object" ? event.booking.total || 0 : 0 })), ...filteredExpenses.map((expense) => ({ date: expense.date, name: expense.title, type: "Expense", status: expense.status, amount: expense.amount }))].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((item) => <div key={`${item.type}-${item.date}-${item.name}`} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#403a34]">{item.name}</p><p className="mt-1 text-xs text-[#9b938a]">{item.type} · {formatDate(item.date)}</p></div><div className="text-right"><p className={`text-sm font-bold ${item.type === "Expense" ? "text-[#a7773f]" : "text-[#557555]"}`}>{item.type === "Expense" ? "-" : ""}{formatCurrency(item.amount)}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{item.status}</p></div></div>)}</div></section>
      </>}
    </main>
  );
}

function Metric({ icon, label, value, tone = "purple" }: { icon: React.ReactNode; label: string; value: string; tone?: "purple" | "gold" | "green" | "red" | "blue" }) {
  const styles = { purple: "bg-[#F1EDF8] text-[#6B5B95]", gold: "bg-[#F4EBDD] text-[#9A7B4F]", green: "bg-green-50 text-green-700", red: "bg-red-50 text-red-700", blue: "bg-blue-50 text-blue-700" };
  return <article className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[tone]}`}>{icon}</div><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 text-xl font-bold text-[#29241f]">{value}</p></article>;
}

function ReportPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2 text-[#6B5B95]"><span>{icon}</span><h2 className="text-lg font-semibold text-[#29241f]">{title}</h2></div><div className="mt-5">{children}</div></section>;
}

function Bars({ items, color }: { items: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <div className="space-y-3">{items.map((item) => <div key={item.label} className="grid grid-cols-[90px_1fr_28px] items-center gap-3 text-xs"><span className="truncate font-medium text-gray-600">{item.label}</span><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${(item.value / max) * 100}%` }} /></div><span className="text-right font-bold text-gray-700">{item.value}</span></div>)}</div>;
}

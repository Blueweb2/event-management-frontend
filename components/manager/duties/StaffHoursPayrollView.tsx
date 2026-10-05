"use client";

import { useState, useMemo } from "react";
import {
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  CreditCard,
  Building2,
  Check,
  ChevronRight,
  Sparkles,
  MapPin,
  Loader2,
  ListChecks,
  Plus,
  Tag,
  UserCheck,
  Lock,
} from "lucide-react";
import type { Duty } from "./constants";
import { updateAssignmentPayment } from "@/lib/assignment.api";
import { formatTime24to12, calculateHoursFromTime } from "@/lib/duty-mapper";

interface StaffHoursPayrollViewProps {
  duties: Duty[];
  token: string;
  onRefresh?: () => void;
  onManageChecklist?: (duty: Duty) => void;
}

export default function StaffHoursPayrollView({
  duties,
  token,
  onRefresh,
  onManageChecklist,
}: StaffHoursPayrollViewProps) {
  const [search, setSearch] = useState("");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Unique staff list for filter
  const staffOptions = useMemo(() => {
    const map = new Map<string, string>();
    duties.forEach((d) => {
      if (d.staffId && d.staffName) {
        map.set(d.staffId, d.staffName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [duties]);

  // Filtered Duties
  const filteredDuties = useMemo(() => {
    const q = search.trim().toLowerCase();
    return duties.filter((d) => {
      const matchesSearch =
        !q ||
        [d.title, d.event, d.staffName, d.department, d.location]
          .filter(Boolean)
          .some((val) => val!.toLowerCase().includes(q));

      const matchesStaff =
        selectedStaffFilter === "ALL" || d.staffId === selectedStaffFilter;

      const matchesPayment =
        paymentFilter === "ALL" ||
        (paymentFilter === "PAID" && d.paymentStatus === "PAID") ||
        (paymentFilter === "PENDING" && d.paymentStatus !== "PAID");

      return matchesSearch && matchesStaff && matchesPayment;
    });
  }, [duties, search, selectedStaffFilter, paymentFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalHours = 0;
    let totalPayroll = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    duties.forEach((d) => {
      let hours = d.totalHours || calculateHoursFromTime(d.startTime, d.endTime);
      const rate = d.hourlyRate || 0;
      const amount = d.totalAmount || hours * rate;

      totalHours += hours;
      totalPayroll += amount;

      if (d.paymentStatus === "PAID") {
        paidAmount += amount;
      } else {
        pendingAmount += amount;
      }
    });

    return {
      totalHours: totalHours.toFixed(1),
      totalPayroll,
      paidAmount,
      pendingAmount,
      totalShifts: duties.length,
    };
  }, [duties]);

  const handleTogglePayment = async (duty: Duty) => {
    if (!token) return;
    const nextStatus = duty.paymentStatus === "PAID" ? "PENDING" : "PAID";
    if (nextStatus === "PAID" && duty.status !== "COMPLETED") {
      setToastMessage("Shift is not completed yet. Only completed shifts can be marked as paid.");
      setTimeout(() => setToastMessage(""), 3500);
      return;
    }
    try {
      setUpdatingId(duty.id);
      await updateAssignmentPayment(
        duty.id,
        {
          paymentStatus: nextStatus,
          paymentReference: nextStatus === "PAID" ? `PAY-${Date.now().toString().slice(-6)}` : "",
          paidAt: nextStatus === "PAID" ? new Date().toISOString() : undefined,
        },
        token
      );
      setToastMessage(`Payment marked as ${nextStatus} for ${duty.staffName}`);
      setTimeout(() => setToastMessage(""), 3500);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Failed to update payment status", err);
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to update payment status";
      setToastMessage(errMsg);
      setTimeout(() => setToastMessage(""), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredDuties.length === 0) return;
    const headers = [
      "Staff Name",
      "Department",
      "Event Name",
      "Duty Title",
      "Date",
      "Start Time",
      "End Time",
      "Hours Worked",
      "Hourly Rate (₹)",
      "Total Pay (₹)",
      "Confirmation Status",
      "Payment Status",
      "Paid Date",
    ];

    const rows = filteredDuties.map((d) => {
      let hours = d.totalHours || 0;
      if (!hours && d.startTime && d.endTime) {
        const [sH, sM] = d.startTime.split(":").map(Number);
        const [eH, eM] = d.endTime.split(":").map(Number);
        let startMin = sH * 60 + (sM || 0);
        let endMin = eH * 60 + (eM || 0);
        if (endMin < startMin) endMin += 24 * 60;
        hours = Math.round(((endMin - startMin) / 60) * 100) / 100;
      }
      const rate = d.hourlyRate || 0;
      const amount = d.totalAmount || hours * rate;

      return [
        `"${d.staffName.replace(/"/g, '""')}"`,
        `"${(d.department || "").replace(/"/g, '""')}"`,
        `"${d.event.replace(/"/g, '""')}"`,
        `"${d.title.replace(/"/g, '""')}"`,
        `"${d.eventDate}"`,
        `"${d.startTime}"`,
        `"${d.endTime}"`,
        hours,
        rate,
        amount.toFixed(2),
        `"${d.status}"`,
        `"${d.paymentStatus || "PENDING"}"`,
        `"${d.paidAt ? new Date(d.paidAt).toLocaleDateString() : ""}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute(
      "download",
      `staff_working_hours_payroll_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [bulkProcessing, setBulkProcessing] = useState(false);

  const completedPendingCount = useMemo(
    () => filteredDuties.filter((d) => d.paymentStatus !== "PAID" && d.status === "COMPLETED").length,
    [filteredDuties]
  );

  const handleBulkPayPending = async () => {
    if (!token) return;
    const pendingToPay = filteredDuties.filter(
      (d) => d.paymentStatus !== "PAID" && d.status === "COMPLETED"
    );
    if (pendingToPay.length === 0) {
      setToastMessage("No completed shifts pending payout found.");
      setTimeout(() => setToastMessage(""), 3500);
      return;
    }

    if (!confirm(`Are you sure you want to mark ${pendingToPay.length} completed shift(s) as PAID?`)) {
      return;
    }

    try {
      setBulkProcessing(true);
      await Promise.all(
        pendingToPay.map((duty) =>
          updateAssignmentPayment(
            duty.id,
            {
              paymentStatus: "PAID",
              paymentReference: `PAY-${Date.now().toString().slice(-6)}-${duty.id.slice(-4)}`,
              paidAt: new Date().toISOString(),
            },
            token
          )
        )
      );
      setToastMessage(`Successfully marked ${pendingToPay.length} completed shift(s) as PAID!`);
      setTimeout(() => setToastMessage(""), 4000);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Failed to bulk update payment status", err);
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to bulk update payment status";
      setToastMessage(errMsg);
      setTimeout(() => setToastMessage(""), 4000);
    } finally {
      setBulkProcessing(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
            <span>Completed</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200">
            <Clock size={11} className="text-blue-600 animate-pulse shrink-0" />
            <span>In Progress</span>
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
            <UserCheck size={11} className="text-amber-600 shrink-0" />
            <span>Confirmed</span>
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50/70 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200">
            <Clock size={11} className="text-amber-600 shrink-0" />
            <span>Pending</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
            <AlertCircle size={11} className="text-rose-600 shrink-0" />
            <span>Declined</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 border border-gray-200">
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const renderPaymentButton = (duty: Duty) => {
    const isPaid = duty.paymentStatus === "PAID";
    const isUpdating = updatingId === duty.id;

    if (isPaid) {
      return (
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleTogglePayment(duty)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 shadow-sm"
          title="Click to revert to pending"
        >
          {isUpdating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <>
              <Check size={12} className="shrink-0" />
              <span>Paid</span>
            </>
          )}
        </button>
      );
    }

    if (duty.status === "COMPLETED") {
      return (
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleTogglePayment(duty)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition active:scale-95 bg-[#29241f] text-white hover:bg-black shadow-sm"
        >
          {isUpdating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <>
              <IndianRupee size={12} className="shrink-0" />
              <span>Mark as Paid</span>
            </>
          )}
        </button>
      );
    }

    return (
      <span
        className="inline-flex items-center justify-center gap-1 rounded-xl bg-gray-100 px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 border border-gray-200 cursor-not-allowed select-none"
        title="Shift is pending or incomplete. Only completed works can be marked as paid."
      >
        <Lock size={11} className="text-gray-400 shrink-0" />
        <span>Pending Work</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Header Interactive Metric Cards */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
        {/* Total Hours */}
        <button
          type="button"
          onClick={() => setPaymentFilter("ALL")}
          className={`text-left rounded-xl sm:rounded-2xl border p-3 sm:p-4 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] ${
            paymentFilter === "ALL"
              ? "border-[#29241f] bg-white ring-2 ring-[#29241f]/10"
              : "border-[#e8e1d8] bg-white hover:border-gray-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-gray-500">Total Hours</span>
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-amber-50 text-amber-700 shrink-0">
              <Clock size={14} className="sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-black text-[#29241f] truncate">
            {metrics.totalHours} <span className="text-xs sm:text-sm font-semibold text-gray-500">hrs</span>
          </p>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-gray-400 font-medium truncate">
            {metrics.totalShifts} duty shifts · <span className="text-blue-600 underline">All</span>
          </p>
        </button>

        {/* Total Payroll */}
        <button
          type="button"
          onClick={() => setPaymentFilter("ALL")}
          className={`text-left rounded-xl sm:rounded-2xl border p-3 sm:p-4 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] ${
            paymentFilter === "ALL"
              ? "border-[#29241f] bg-white ring-2 ring-[#29241f]/10"
              : "border-[#e8e1d8] bg-white hover:border-gray-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-gray-500">Total Payroll</span>
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-[#f7efe4] text-[#a7773f] shrink-0">
              <IndianRupee size={14} className="sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-black text-[#29241f] truncate">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(metrics.totalPayroll)}
          </p>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-gray-400 font-medium truncate">
            Gross compensation
          </p>
        </button>

        {/* Paid Amount */}
        <button
          type="button"
          onClick={() => setPaymentFilter("PAID")}
          className={`text-left rounded-xl sm:rounded-2xl border p-3 sm:p-4 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] ${
            paymentFilter === "PAID"
              ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30"
              : "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-800">Paid Amount</span>
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <Check size={14} className="sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-black text-emerald-900 truncate">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(metrics.paidAmount)}
          </p>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-emerald-700 font-medium truncate">
            Disbursed · <span className="underline">Paid</span>
          </p>
        </button>

        {/* Pending Payout */}
        <button
          type="button"
          onClick={() => setPaymentFilter("PENDING")}
          className={`text-left rounded-xl sm:rounded-2xl border p-3 sm:p-4 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] ${
            paymentFilter === "PENDING"
              ? "border-amber-600 bg-amber-50 ring-2 ring-amber-500/30"
              : "border-amber-200 bg-amber-50/50 hover:bg-amber-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-amber-800">Pending Payout</span>
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <CreditCard size={14} className="sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-black text-amber-900 truncate">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(metrics.pendingAmount)}
          </p>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-amber-700 font-medium truncate">
            Due · <span className="underline">Pending</span>
          </p>
        </button>
      </section>

      {/* Filter Toolbar & Batch Actions */}
      <section className="rounded-xl sm:rounded-2xl border border-[#e8e1d8] bg-white p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff, event, duty, department..."
              className="h-10 sm:h-11 w-full rounded-xl border border-gray-200 bg-[#fdfbf8] pl-10 pr-4 text-xs text-gray-900 outline-none focus:border-[#b8894b] transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-2.5">
            {/* Quick Status Pill Toggles */}
            <div className="grid grid-cols-3 sm:flex items-center rounded-xl bg-gray-100 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setPaymentFilter("ALL")}
                className={`rounded-lg py-1.5 px-3 text-center text-xs font-bold transition ${
                  paymentFilter === "ALL"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter("PENDING")}
                className={`rounded-lg py-1.5 px-3 text-center text-xs font-bold transition ${
                  paymentFilter === "PENDING"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-amber-800 hover:text-amber-950"
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter("PAID")}
                className={`rounded-lg py-1.5 px-3 text-center text-xs font-bold transition ${
                  paymentFilter === "PAID"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-800 hover:text-emerald-950"
                }`}
              >
                Paid
              </button>
            </div>

            {/* Staff Filter Dropdown */}
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="h-10 sm:h-11 w-full sm:w-auto rounded-xl border border-gray-200 bg-[#fdfbf8] px-3 text-xs font-medium text-gray-700 outline-none focus:border-[#b8894b] shrink-0"
            >
              <option value="ALL">All Staff Members</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Bulk Pay Action for Completed Shifts */}
              {completedPendingCount > 0 && (
                <button
                  type="button"
                  disabled={bulkProcessing}
                  onClick={handleBulkPayPending}
                  className="flex-1 sm:flex-initial flex h-10 sm:h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 sm:px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50 shrink-0"
                >
                  {bulkProcessing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  <span>Pay Completed ({completedPendingCount})</span>
                </button>
              )}

              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex-1 sm:flex-initial flex h-10 sm:h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 sm:px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm shrink-0"
              >
                <Download size={14} className="text-[#a7773f]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Summary */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
          <span>
            Showing <strong className="text-gray-800">{filteredDuties.length}</strong> of{" "}
            {duties.length} total shifts
          </span>
          {(search || selectedStaffFilter !== "ALL" || paymentFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedStaffFilter("ALL");
                setPaymentFilter("ALL");
              }}
              className="font-bold text-[#9A7B4F] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </section>

      {/* Staff Hours & Payment Records */}
      <section className="space-y-3">
        {filteredDuties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 sm:p-12 text-center">
            <Clock size={32} className="text-gray-300" />
            <p className="mt-3 text-sm font-bold text-gray-700">No duty shifts match your filter</p>
            <p className="mt-1 text-xs text-gray-400">Try adjusting your search criteria or filter options.</p>
          </div>
        ) : (
          <>
            {/* ========================================================
                MOBILE CARDS VIEW (Visible on mobile/small screens < md)
            ======================================================== */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredDuties.map((duty) => {
                const hours = duty.totalHours || calculateHoursFromTime(duty.startTime, duty.endTime);
                const rate = duty.hourlyRate || 0;
                const totalPay = duty.totalAmount || hours * rate;
                const isPaid = duty.paymentStatus === "PAID";

                return (
                  <div
                    key={`mob-${duty.id}`}
                    className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm space-y-3 hover:border-[#d4c5b3] transition"
                  >
                    {/* Card Header: Staff Avatar, Name, Department & Shift Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#f4efe8] pb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] font-black text-sm text-[#9A7B4F]">
                          {duty.staffName ? duty.staffName[0].toUpperCase() : "S"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{duty.staffName}</p>
                          <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                            <Building2 size={11} className="text-[#a7773f] shrink-0" />
                            <span>{duty.department || "Operations"}</span>
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">{renderStatusBadge(duty.status)}</div>
                    </div>

                    {/* Event & Location Info */}
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="text-[#a7773f]">✦</span>
                        <span className="truncate">{duty.event}</span>
                      </div>
                      {duty.location && (
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 pl-4">
                          <MapPin size={11} className="text-gray-400 shrink-0" />
                          <span className="truncate">{duty.location}</span>
                        </p>
                      )}
                    </div>

                    {/* Date & Shift Timing Box */}
                    <div className="flex items-center justify-between rounded-xl bg-[#faf8f5] p-2.5 border border-[#eee8e1] text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <Calendar size={13} className="text-[#a7773f] shrink-0" />
                        <span>{duty.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                        <Clock size={12} className="text-gray-400 shrink-0" />
                        <span>{formatTime24to12(duty.startTime)} - {formatTime24to12(duty.endTime)}</span>
                        <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                          {hours}h
                        </span>
                      </div>
                    </div>

                    {/* Duty Title & Subtask Checklist */}
                    <div className="space-y-1.5">
                      <div className="text-xs">
                        <span className="text-gray-400 font-medium">Duty: </span>
                        <span className="font-bold text-gray-800">{duty.title}</span>
                      </div>
                      {duty.description && (
                        <p className="text-[11px] text-gray-500 line-clamp-2">{duty.description}</p>
                      )}

                      {/* Checklist Badge / Action */}
                      <div className="pt-0.5">
                        {duty.checklist && duty.checklist.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => onManageChecklist && onManageChecklist(duty)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#faf6f0] border border-[#e8e1d8] px-2.5 py-1 text-[11px] font-bold text-[#9a6c37] hover:bg-[#f5efe5] transition w-full justify-between"
                          >
                            <span className="flex items-center gap-1.5">
                              <ListChecks size={13} className="text-[#a7773f]" />
                              <span>Subtasks ({duty.checklist.filter((c) => c.completed).length}/{duty.checklist.length})</span>
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-black">
                              {Math.round(
                                (duty.checklist.filter((c) => c.completed).length / duty.checklist.length) * 100
                              )}% done
                            </span>
                          </button>
                        ) : (
                          onManageChecklist && (
                            duty.status === "ACCEPTED" ? (
                              <button
                                type="button"
                                onClick={() => onManageChecklist(duty)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9a6c37] hover:underline transition"
                              >
                                <Plus size={12} />
                                <span>Assign Checklist Subtasks</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <Clock size={11} className="text-amber-600" />
                                <span>Awaiting Staff Acceptance</span>
                              </span>
                            )
                          )
                        )}
                      </div>
                    </div>

                    {/* Financial Footer: Pay Rate + Total + Action Button */}
                    <div className="flex items-center justify-between border-t border-[#f4efe8] pt-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Compensation</div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-gray-900">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalPay)}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            (@ {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rate)}/hr)
                          </span>
                        </div>
                        {isPaid && duty.paidAt && (
                          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                            Paid on {new Date(duty.paidAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div>{renderPaymentButton(duty)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ========================================================
                DESKTOP DATA TABLE VIEW (Visible on md+ screens)
            ======================================================== */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#eee8e1] bg-[#faf8f5] text-[11px] font-bold uppercase tracking-wider text-[#756d64]">
                    <tr>
                      <th className="px-4 py-3.5">Staff & Department</th>
                      <th className="px-4 py-3.5">Event & Location</th>
                      <th className="px-4 py-3.5">Date & Shift Hours</th>
                      <th className="px-4 py-3.5">Duties Covered</th>
                      <th className="px-4 py-3.5 text-right">Rate & Total Pay</th>
                      <th className="px-4 py-3.5 text-center">Shift Status</th>
                      <th className="px-4 py-3.5 text-right">Payment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eae1]">
                    {filteredDuties.map((duty) => {
                      const hours = duty.totalHours || calculateHoursFromTime(duty.startTime, duty.endTime);
                      const rate = duty.hourlyRate || 0;
                      const totalPay = duty.totalAmount || hours * rate;
                      const isPaid = duty.paymentStatus === "PAID";

                      return (
                        <tr key={duty.id} className="transition hover:bg-[#fdfbf8]">
                          {/* Staff */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] font-bold text-[#9A7B4F]">
                                {duty.staffName ? duty.staffName[0].toUpperCase() : "S"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate">{duty.staffName}</p>
                                <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                                  <Building2 size={11} /> {duty.department || "Operations"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Event */}
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-gray-900">{duty.event}</p>
                            {duty.location && (
                              <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={11} className="text-[#a7773f]" /> {duty.location}
                              </p>
                            )}
                          </td>

                          {/* Date & Shift */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                              <Calendar size={12} className="text-[#a7773f]" />
                              <span>{duty.eventDate}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                              <Clock size={11} />
                              <span>{formatTime24to12(duty.startTime)} – {formatTime24to12(duty.endTime)}</span>
                              <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                {hours} hrs
                              </span>
                            </div>
                          </td>

                          {/* Duties Covered */}
                          <td className="px-4 py-3.5 max-w-xs">
                            <p className="font-semibold text-gray-900">{duty.title}</p>
                            {duty.description ? (
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">{duty.description}</p>
                            ) : null}
                            <div className="mt-1 flex items-center gap-1.5">
                              {duty.checklist && duty.checklist.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => onManageChecklist && onManageChecklist(duty)}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-[#faf6f0] border border-[#e8e1d8] px-2 py-0.5 text-[10px] font-bold text-[#9a6c37] hover:bg-[#f5efe5] transition"
                                >
                                  <ListChecks size={12} className="text-[#a7773f]" />
                                  <span>
                                    {duty.checklist.filter((c) => c.completed).length}/{duty.checklist.length} subtasks (
                                    {Math.round(
                                      (duty.checklist.filter((c) => c.completed).length / duty.checklist.length) * 100
                                    )}%)
                                  </span>
                                </button>
                              ) : (
                                onManageChecklist && (
                                  duty.status === "ACCEPTED" ? (
                                    <button
                                      type="button"
                                      onClick={() => onManageChecklist(duty)}
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9a6c37] hover:underline transition"
                                    >
                                      <Plus size={12} />
                                      <span>Assign Subtasks</span>
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                      <Clock size={11} className="text-amber-600" />
                                      <span>Awaiting Staff Acceptance</span>
                                    </span>
                                  )
                                )
                              )}
                            </div>
                          </td>

                          {/* Rate & Total Pay */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <p className="font-black text-gray-900 text-sm">
                              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalPay)}
                            </p>
                            <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-gray-500 font-medium">
                              <Tag size={10} className="text-gray-400" />
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rate)} / hr</span>
                            </p>
                            {isPaid && duty.paidAt && (
                              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                                Paid {new Date(duty.paidAt).toLocaleDateString()}
                              </p>
                            )}
                          </td>

                          {/* Confirmation / Shift Status */}
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            {renderStatusBadge(duty.status)}
                          </td>

                          {/* Payment Action */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            {renderPaymentButton(duty)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

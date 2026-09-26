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
} from "lucide-react";
import type { Duty } from "./constants";
import { updateAssignmentPayment } from "@/lib/assignment.api";

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
      // Calculate hours from duty if totalHours not saved
      let hours = d.totalHours || 0;
      if (!hours && d.startTime && d.endTime) {
        const [sH, sM] = d.startTime.split(":").map(Number);
        const [eH, eM] = d.endTime.split(":").map(Number);
        if (!isNaN(sH) && !isNaN(eH)) {
          let startMin = sH * 60 + (sM || 0);
          let endMin = eH * 60 + (eM || 0);
          if (endMin < startMin) endMin += 24 * 60;
          hours = Math.round(((endMin - startMin) / 60) * 100) / 100;
        }
      }

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
    } catch (err) {
      console.error("Failed to update payment status", err);
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

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Metric Cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total Hours</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Clock size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-[#29241f]">{metrics.totalHours} <span className="text-sm font-semibold text-gray-500">hrs</span></p>
          <p className="mt-1 text-[11px] text-gray-400">Across {metrics.totalShifts} duty shifts</p>
        </div>

        <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total Payroll</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
              <IndianRupee size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-[#29241f]">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(metrics.totalPayroll)}
          </p>
          <p className="mt-1 text-[11px] text-gray-400">Gross compensation due</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Paid Amount</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Check size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(metrics.paidAmount)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700">Completed disbursements</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Pending Payout</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <CreditCard size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(metrics.pendingAmount)}
          </p>
          <p className="mt-1 text-[11px] text-amber-700">Awaiting disbursement</p>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff member, event, duty or department..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#fdfbf8] pl-10 pr-4 text-xs text-gray-900 outline-none focus:border-[#b8894b]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Staff Filter */}
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-[#fdfbf8] px-3 text-xs font-medium text-gray-700 outline-none focus:border-[#b8894b]"
            >
              <option value="ALL">All Staff Members</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="h-11 rounded-xl border border-gray-200 bg-[#fdfbf8] px-3 text-xs font-medium text-gray-700 outline-none focus:border-[#b8894b]"
            >
              <option value="ALL">All Payments</option>
              <option value="PENDING">Pending Payment</option>
              <option value="PAID">Disbursed / Paid</option>
            </select>

            {/* CSV Export */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm"
            >
              <Download size={14} className="text-[#a7773f]" />
              <span>Export Roster CSV</span>
            </button>
          </div>
        </div>
      </section>

      {/* Staff Hours & Payment Records List */}
      <section className="space-y-3">
        {filteredDuties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Clock size={32} className="text-gray-300" />
            <p className="mt-3 text-sm font-bold text-gray-700">No duty shifts match your filter</p>
            <p className="mt-1 text-xs text-gray-400">Try adjusting your search criteria or date filter.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
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
                    let hours = duty.totalHours || 0;
                    if (!hours && duty.startTime && duty.endTime) {
                      const [sH, sM] = duty.startTime.split(":").map(Number);
                      const [eH, eM] = duty.endTime.split(":").map(Number);
                      let startMin = sH * 60 + (sM || 0);
                      let endMin = eH * 60 + (eM || 0);
                      if (endMin < startMin) endMin += 24 * 60;
                      hours = Math.round(((endMin - startMin) / 60) * 100) / 100;
                    }
                    const rate = duty.hourlyRate || 0;
                    const totalPay = duty.totalAmount || hours * rate;

                    const isPaid = duty.paymentStatus === "PAID";

                    return (
                      <tr key={duty.id} className="transition hover:bg-[#fdfbf8]">
                        {/* Staff */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] font-bold text-[#9A7B4F]">
                              {duty.staffName[0]}
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
                            <span>{duty.startTime} – {duty.endTime}</span>
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
                                className="inline-flex items-center gap-1 rounded-md bg-[#faf6f0] border border-[#e8e1d8] px-2 py-0.5 text-[10px] font-bold text-[#9a6c37] hover:bg-[#f5efe5] transition"
                              >
                                <span>
                                  ✓ {duty.checklist.filter((c) => c.completed).length}/{duty.checklist.length} subtasks (
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
                                    + Assign Subtasks
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    Awaiting Staff Acceptance
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
                          <p className="text-[10px] text-gray-500">
                            @ {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rate)} / hr
                          </p>
                        </td>

                        {/* Confirmation Status */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              duty.status === "ACCEPTED"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : duty.status === "ASSIGNED"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : duty.status === "REJECTED"
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {duty.status === "ACCEPTED" ? "Confirmed" : duty.status === "ASSIGNED" ? "Pending" : duty.status}
                          </span>
                        </td>

                        {/* Payment Action */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            disabled={updatingId === duty.id}
                            onClick={() => handleTogglePayment(duty)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-[#29241f] text-white hover:bg-black shadow-sm"
                            }`}
                          >
                            {updatingId === duty.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : isPaid ? (
                              <>
                                <Check size={12} />
                                <span>Paid</span>
                              </>
                            ) : (
                              <>
                                <IndianRupee size={12} />
                                <span>Mark as Paid</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

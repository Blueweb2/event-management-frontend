"use strict";
"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  X,
  Calendar,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Event, EventPaymentLog, recordEventPayment } from "@/lib/event.api";

interface EventClientPaymentCardProps {
  event: Event;
  token?: string;
  onPaymentRecorded?: () => void;
}

export default function EventClientPaymentCard({
  event,
  token,
  onPaymentRecorded,
}: EventClientPaymentCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentType, setPaymentType] = useState<"ADVANCE" | "INSTALLMENT" | "FINAL_BALANCE">("INSTALLMENT");
  const [transactionId, setTransactionId] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Extract financial variables
  const bookingObj = typeof event.booking === "object" && event.booking !== null ? event.booking : null;
  const eventTotal = bookingObj?.total || 0;
  
  // Paid amount prioritization
  const eventPaid = event.paidAmount ?? event.advancePayment ?? bookingObj?.paidAmount ?? bookingObj?.advancePayment ?? 0;
  const advancePayment = event.advancePayment ?? bookingObj?.advancePayment ?? 0;
  const eventBalance = Math.max(0, eventTotal - eventPaid);

  // Status computation
  const isSettled = (event.paymentStatus === "PAID" || (eventBalance === 0 && eventTotal > 0));
  const isPartiallyPaid = (event.paymentStatus === "PARTIAL" || (eventPaid > 0 && eventBalance > 0));
  const isUnpaid = !isSettled && !isPartiallyPaid;

  const paymentPercentage = eventTotal > 0 ? Math.min(100, Math.round((eventPaid / eventTotal) * 100)) : 0;

  // History list
  const history: EventPaymentLog[] = (
    event.paymentHistory && event.paymentHistory.length > 0
      ? event.paymentHistory
      : bookingObj?.paymentHistory && bookingObj.paymentHistory.length > 0
      ? bookingObj.paymentHistory
      : []
  );

  const handleOpenModal = (presetType?: "ADVANCE" | "INSTALLMENT" | "FINAL_BALANCE") => {
    setErrorMessage("");
    if (presetType) {
      setPaymentType(presetType);
      if (presetType === "FINAL_BALANCE" && eventBalance > 0) {
        setAmount(eventBalance);
      } else {
        setAmount("");
      }
    } else {
      if (eventBalance > 0 && eventPaid > 0) {
        setPaymentType("FINAL_BALANCE");
        setAmount(eventBalance);
      } else if (eventPaid === 0) {
        setPaymentType("ADVANCE");
        setAmount("");
      } else {
        setPaymentType("INSTALLMENT");
        setAmount("");
      }
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setErrorMessage("Please enter a valid payment amount greater than zero.");
      return;
    }

    const isUpcoming = ["Upcoming", "CONFIRMED", "Confirmed"].includes(event.status || "");
    const isFinalSettlement =
      paymentType === "FINAL_BALANCE" ||
      (Number(amount) >= eventBalance && eventBalance > 0);

    if (isUpcoming && isFinalSettlement && paymentType !== "ADVANCE") {
      setErrorMessage(
        "Only in-progress or completed events can be marked as fully settled. Please record this payment as an Advance Deposit for upcoming events."
      );
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      await recordEventPayment(
        event._id,
        {
          amount: Number(amount),
          paymentMethod,
          paymentType,
          transactionId: transactionId.trim(),
          paymentDate,
          notes: notes.trim(),
        },
        token
      );

      setSuccessToast(`Payment of ₹${Number(amount).toLocaleString("en-IN")} recorded successfully.`);
      setModalOpen(false);
      setAmount("");
      setTransactionId("");
      setNotes("");

      if (onPaymentRecorded) {
        onPaymentRecorded();
      }

      setTimeout(() => setSuccessToast(""), 4500);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to record client payment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-[#e8e1d8] bg-white shadow-sm">
      {/* Toast Notification */}
      {successToast && (
        <div className="flex items-center justify-between bg-emerald-600 px-5 py-3 text-xs font-bold text-white transition animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast("")}
            className="text-emerald-100 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#f1ece5] bg-gradient-to-r from-[#faf8f5] to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
       
          <h2 className="mt-1 text-xl font-black tracking-tight text-[#29241f]">
            Client Payment Overview
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Real-time tracking of contracted fees, deposits, payments collected, and balance dues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Badge */}
       

          {/* Action Triggers */}
          {eventPaid === 0 && (
            <button
              type="button"
              onClick={() => handleOpenModal("ADVANCE")}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-700 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 active:scale-95"
            >
              <Plus size={14} />
              <span>Record Advance</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#29241f] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-95"
          >
            <Plus size={14} className="text-[#D4AF37]" />
            <span>Add Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 divide-x divide-y divide-[#f1ece5] sm:grid-cols-4 sm:divide-y-0 border-b border-[#f1ece5]">
        {/* KPI 1: Total Contract Amount */}
        <div className="bg-white p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Total Contracted
          </p>
          <p className="mt-1.5 text-xl font-black text-[#29241f] sm:text-2xl">
            ₹{eventTotal.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11px] font-medium text-gray-500">
            {bookingObj?.services?.length ?? 0} services quoted
          </p>
        </div>

        {/* KPI 2: Advance Deposit */}
        <div className="bg-white p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Advance Deposit
          </p>
          <p className="mt-1.5 text-xl font-black text-[#8C7A55] sm:text-2xl">
            ₹{advancePayment.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11px] font-medium text-gray-500">
            Initial booking token
          </p>
        </div>

        {/* KPI 3: Total Paid Amount */}
        <div className="bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-gray-400">
              Total Paid Amount
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              {paymentPercentage}%
            </span>
          </div>
          <p className="mt-1.5 text-xl font-black text-emerald-700 sm:text-2xl">
            ₹{eventPaid.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11px] font-medium text-gray-500">
            {history.length} transaction{history.length === 1 ? "" : "s"} logged
          </p>
        </div>

        {/* KPI 4: Remaining Balance */}
        <div className={`p-5 ${eventBalance > 0 ? "bg-amber-50/40" : "bg-emerald-50/30"}`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-gray-400">
              Balance Due
            </p>
            {eventBalance > 0 ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                Pending
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Settled
              </span>
            )}
          </div>
          <p
            className={`mt-1.5 text-xl font-black sm:text-2xl ${
              eventBalance > 0 ? "text-red-600" : "text-emerald-700"
            }`}
          >
            ₹{eventBalance.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11px] font-medium text-gray-500">
            {eventBalance > 0 ? "Pending collection" : "Zero balance outstanding"}
          </p>
        </div>
      </div>

      {/* Itemized Payment History */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
            Payment History & Receipts ({history.length})
          </h3>
          {eventBalance > 0 && (
            <button
              type="button"
              onClick={() => handleOpenModal("FINAL_BALANCE")}
              className="text-xs font-bold text-[#8C7A55] hover:text-[#29241f] underline transition"
            >
              
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-[#faf8f5] py-8 text-center">
            <CreditCard size={28} className="text-gray-300" />
            <p className="mt-2 text-xs font-bold text-gray-600">No payment records logged yet</p>
            <p className="mt-0.5 text-[11px] text-gray-400 max-w-sm">
              Click &quot;Record Payment&quot; to log client deposits, installment checks, or final settlements.
            </p>
            <button
              type="button"
              onClick={() => handleOpenModal("ADVANCE")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50"
            >
              <Plus size={12} className="text-[#9a6c37]" />
              <span>Record Initial Deposit</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-extrabold uppercase text-gray-400">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Type</th>
                  <th className="pb-2.5">Payment Method</th>
                  <th className="pb-2.5">Transaction Ref</th>
                  <th className="pb-2.5">Recorded By</th>
                  <th className="pb-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item, idx) => {
                  const recordedByName =
                    typeof item.recordedBy === "object" && item.recordedBy !== null
                      ? item.recordedBy.name
                      : typeof item.recordedBy === "string"
                      ? item.recordedBy
                      : "Staff";

                  return (
                    <tr key={item._id || idx} className="hover:bg-[#faf8f5] transition">
                      <td className="py-3 font-semibold text-gray-700">
                        {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : "—"}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex rounded-md bg-[#F4EFE4] px-2 py-0.5 text-[10px] font-extrabold text-[#8C7A55]">
                          {item.paymentType || "PAYMENT"}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-gray-600">
                        <div>{item.paymentMethod || "Cash"}</div>
                        {item.notes && (
                          <div className="text-[10px] text-gray-400 italic max-w-xs truncate" title={item.notes}>
                            {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-gray-500 font-mono text-[11px]">
                        {item.transactionId || "—"}
                      </td>
                      <td className="py-3 text-gray-500">
                        {recordedByName}
                      </td>
                      <td className="py-3 text-right font-extrabold text-[#29241f]">
                        ₹{item.amount?.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-[#e8e1d8] bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-black transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#9a6c37]">
              <Receipt size={16} />
              <span>Financial Ledger</span>
            </div>
            <h3 className="mt-1 text-lg font-black text-[#29241f]">
              Record Client Payment
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Log an advance deposit, milestone installment, or final settlement for &quot;{event.eventName}&quot;.
            </p>

            {/* Quick Balance Reminder */}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#faf8f5] border border-[#f1ece5] p-3 text-xs">
              <span className="text-gray-500">Outstanding Balance:</span>
              <span className="font-extrabold text-red-600">
                ₹{eventBalance.toLocaleString("en-IN")}
              </span>
            </div>

            {errorMessage && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {/* Payment Type */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-gray-500">
                  Payment Type
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => {
                    const nextType = e.target.value as "ADVANCE" | "INSTALLMENT" | "FINAL_BALANCE";
                    setPaymentType(nextType);
                    if (nextType === "FINAL_BALANCE" && eventBalance > 0) {
                      setAmount(eventBalance);
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-2xs focus:border-[#29241f] focus:outline-hidden"
                >
                  <option value="ADVANCE">Advance Deposit (Initial Booking Token)</option>
                  <option value="INSTALLMENT">Milestone / Partial Installment</option>
                  <option value="FINAL_BALANCE">Final Balance Settlement</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-extrabold uppercase text-gray-500">
                    Amount (₹)
                  </label>
                  {eventBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(eventBalance)}
                      className="text-[10px] font-bold text-[#8C7A55] hover:underline"
                    >
                      Fill Remaining (₹{eventBalance.toLocaleString("en-IN")})
                    </button>
                  )}
                </div>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Enter collected amount"
                    className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-7 pr-3 text-xs font-bold text-gray-800 shadow-2xs focus:border-[#29241f] focus:outline-hidden"
                  />
                </div>

                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType("ADVANCE");
                      setAmount(Math.round(eventTotal * 0.25));
                    }}
                    className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 hover:bg-[#F4EFE4] hover:text-[#8C7A55] transition"
                  >
                    25% Advance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAmount(Math.round(eventTotal * 0.5));
                    }}
                    className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 hover:bg-[#F4EFE4] hover:text-[#8C7A55] transition"
                  >
                    50%
                  </button>
                  {eventBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType(eventPaid === 0 ? "ADVANCE" : "FINAL_BALANCE");
                        setAmount(eventBalance);
                      }}
                      className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition"
                    >
                      100% Balance (₹{eventBalance.toLocaleString("en-IN")})
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-gray-500">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-2xs focus:border-[#29241f] focus:outline-hidden"
                  >
                    <option value="UPI">UPI / GPay / PhonePe / Paytm</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT / IMPS / RTGS</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Credit/Debit Card">Credit / Debit Card</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-gray-500">
                    Date Received
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-2xs focus:border-[#29241f] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-gray-500">
                  Transaction / Reference ID (Optional)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. UPI Ref # / Cheque # / NEFT UTR"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 shadow-2xs focus:border-[#29241f] focus:outline-hidden"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-gray-500">
                  Notes / Receipt Remark (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid by client via UPI QR at office"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 shadow-2xs focus:border-[#29241f] focus:outline-hidden"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241f] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-95 disabled:opacity-50"
                >
                  {submitting ? "Recording..." : "Confirm & Save"}
                  <ArrowRight size={13} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

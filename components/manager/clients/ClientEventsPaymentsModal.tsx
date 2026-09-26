"use client";

import { useEffect, useState } from "react";
import {
  X,
  CreditCard,
  Calendar,
  MapPin,
  Users,
  Plus,
  CheckCircle2,
  Clock,
  Receipt,
  Loader2,
  AlertCircle,
  Send,
  PieChart,
  Percent,
} from "lucide-react";
import {
  getClientDetails,
  recordBookingPayment,
  type Client,
  type ClientEventDetails,
  type ClientFinancialSummary,
  type RecordPaymentPayload,
} from "@/lib/client.api";
import { useAuth } from "@/hooks/useAuth";

interface ClientEventsPaymentsModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onPaymentRecorded?: () => void;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export default function ClientEventsPaymentsModal({
  isOpen,
  client,
  onClose,
  onPaymentRecorded,
}: ClientEventsPaymentsModalProps) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [events, setEvents] = useState<ClientEventDetails[]>([]);
  const [financialSummary, setFinancialSummary] = useState<ClientFinancialSummary | null>(null);

  // Form state for recording payment
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Transfer");
  const [paymentType, setPaymentType] = useState<"ADVANCE" | "INSTALLMENT" | "FINAL_BALANCE">("ADVANCE");
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [formError, setFormError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const loadDetails = async () => {
    if (!client) return;
    try {
      setLoading(true);
      setError("");
      const res = await getClientDetails(client._id, token || undefined);
      setEvents(res.data.events || []);
      setFinancialSummary(res.data.financialSummary || null);

      if (res.data.events.length > 0 && !selectedBookingId) {
        const firstBookingId = res.data.events[0].booking?._id || res.data.events[0]._id;
        setSelectedBookingId(firstBookingId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load client payment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && client) {
      void loadDetails();
    } else {
      setShowPaymentForm(false);
      setFormError("");
    }
  }, [isOpen, client]);

  if (!isOpen || !client) return null;

  const selectedEvent = events.find(
    (ev) => (ev.booking?._id || ev._id) === selectedBookingId
  );
  const selectedEventTotal = Number(selectedEvent?.booking?.total || (selectedEvent as any)?.total || 0);
  const selectedEventPaid = Number(selectedEvent?.paidAmount || selectedEvent?.booking?.paidAmount || 0);
  const selectedEventBalance = Math.max(0, selectedEventTotal - selectedEventPaid);

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      setFormError("Please select an event to record payment against.");
      return;
    }

    const amountNum = Number(paymentAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setFormError("Please enter a valid payment amount greater than ₹0.");
      return;
    }

    try {
      setSubmittingPayment(true);
      setFormError("");

      const payload: RecordPaymentPayload = {
        amount: amountNum,
        paymentMethod,
        paymentType,
        transactionId: transactionId.trim(),
        paymentDate,
        notes: paymentNotes.trim(),
      };

      await recordBookingPayment(selectedBookingId, payload, token || undefined);

      setSuccessToast(
        `Recorded ${paymentType === "ADVANCE" ? "Advance Deposit" : "Payment"} of ${formatINR(
          amountNum
        )} successfully!`
      );
      setTimeout(() => setSuccessToast(""), 4000);

      // Reset form
      setPaymentAmount("");
      setTransactionId("");
      setPaymentNotes("");
      setShowPaymentForm(false);

      // Reload client events & payment details
      await loadDetails();
      if (onPaymentRecorded) onPaymentRecorded();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const openPaymentForEvent = (
    bookingId: string,
    defaultType: "ADVANCE" | "INSTALLMENT" | "FINAL_BALANCE" = "ADVANCE"
  ) => {
    setSelectedBookingId(bookingId);
    setPaymentType(defaultType);
    setShowPaymentForm(true);
    setFormError("");
  };

  const applyPresetPercentage = (pct: number) => {
    if (pct === 100) {
      setPaymentAmount(selectedEventBalance.toFixed(2));
    } else {
      const calc = Math.round((selectedEventTotal * (pct / 100)) * 100) / 100;
      setPaymentAmount(calc.toFixed(2));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-[#e8e1d8] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Toast */}
        {successToast && (
          <div className="absolute top-4 right-14 z-20 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-md">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex flex-col gap-3 border-b border-[#eee7dc] bg-[#faf8f5] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#29241f] text-lg font-black text-amber-300 shadow-sm">
              {client.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9a6c37]">
                  Client Financial & Event Details (INR ₹)
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    client.status === "Active"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {client.status}
                </span>
              </div>
              <h2 className="text-xl font-black text-[#29241f]">
                {client.name}
              </h2>
              <p className="text-xs text-[#8d847b]">
                📞 {client.phone} · ✉️ {client.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPaymentForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#b8894b] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#a3773e]"
            >
              <Plus size={15} />
              <span>Record Payment / Advance (₹)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Financial Summary Banner */}
        {financialSummary && (
          <div className="bg-gradient-to-r from-[#29241f] via-[#383129] to-[#1c1916] p-5 text-white border-b border-[#eee7dc]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                  Total Contract Value
                </p>
                <p className="mt-0.5 text-lg font-black text-amber-300">
                  {formatINR(financialSummary.totalContractValue)}
                </p>
                <p className="text-[10px] text-gray-400">
                  {financialSummary.totalEventsCount} Event(s)
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                  Total Collected / Advance
                </p>
                <p className="mt-0.5 text-lg font-black text-emerald-400">
                  {formatINR(financialSummary.totalPaidAmount)}
                </p>
                <p className="text-[10px] text-emerald-200/70">
                  Adv: {formatINR(financialSummary.totalAdvancePayment)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300/80">
                  Outstanding Balance
                </p>
                <p className="mt-0.5 text-lg font-black text-rose-400">
                  {formatINR(financialSummary.totalBalanceDue)}
                </p>
                <p className="text-[10px] text-rose-200/70">
                  Remaining due
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Overall Payment Status
                </p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
                      financialSummary.overallPaymentStatus === "PAID"
                        ? "bg-emerald-500 text-white"
                        : financialSummary.overallPaymentStatus === "PARTIAL"
                        ? "bg-amber-500 text-white"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {financialSummary.overallPaymentStatus === "PAID"
                      ? "✓ FULLY PAID"
                      : financialSummary.overallPaymentStatus === "PARTIAL"
                      ? "PARTIAL PAYMENT"
                      : "UNPAID / PENDING"}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            {financialSummary.totalContractValue > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300 mb-1">
                  <span className="flex items-center gap-1">
                    <PieChart size={13} className="text-amber-400" />
                    Overall Collection Progress
                  </span>
                  <span className="font-bold text-amber-300">
                    {Math.min(
                      100,
                      Math.round(
                        (financialSummary.totalPaidAmount /
                          financialSummary.totalContractValue) *
                          100
                      )
                    )}
                    % Collected
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (financialSummary.totalPaidAmount /
                          financialSummary.totalContractValue) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Form to Record Advance Payment or Installment */}
          {showPaymentForm && (
            <div className="rounded-3xl border border-[#b8894b]/40 bg-[#faf6f0] p-5 shadow-md animate-in slide-in-from-top-3">
              <div className="flex items-center justify-between border-b border-[#eee7dc] pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-[#9a6c37]" />
                  <h3 className="text-sm font-black text-[#29241f]">
                    Record Advance Payment or Installment (₹ INR)
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900"
                >
                  Close Form ✕
                </button>
              </div>

              {formError && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 border border-rose-200">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleRecordPaymentSubmit} className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Select Event / Booking */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Target Event / Booking *
                    </label>
                    <select
                      required
                      value={selectedBookingId}
                      onChange={(e) => {
                        setSelectedBookingId(e.target.value);
                        setPaymentAmount("");
                      }}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-[#9a6c37]"
                    >
                      <option value="">-- Choose Event --</option>
                      {events.map((ev) => {
                        const bookingId = ev.booking?._id || ev._id;
                        const eventTotal = Number(ev.booking?.total || (ev as any).total || 0);
                        const paid = Number(ev.paidAmount || ev.booking?.paidAmount || 0);
                        const due = Math.max(0, eventTotal - paid);

                        return (
                          <option key={ev._id} value={bookingId}>
                            {ev.eventName} ({ev.eventType}) — Due: {formatINR(due)}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Payment Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Payment Type *
                    </label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value as any)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-[#9a6c37]"
                    >
                      <option value="ADVANCE">Deposit / Advance Payment</option>
                      <option value="INSTALLMENT">Progress / Installment Payment</option>
                      <option value="FINAL_BALANCE">Final Balance Settlement</option>
                    </select>
                  </div>

                  {/* Payment Amount */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-700">
                        Payment Amount (₹ INR) *
                      </label>

                      {/* Quick Presets */}
                      {selectedEventTotal > 0 && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-gray-400 font-medium">Quick Presets:</span>
                          <button
                            type="button"
                            onClick={() => applyPresetPercentage(20)}
                            className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 font-bold text-amber-900 hover:bg-amber-100 transition"
                          >
                            20% Adv ({formatINR(selectedEventTotal * 0.2)})
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPresetPercentage(50)}
                            className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 font-bold text-amber-900 hover:bg-amber-100 transition"
                          >
                            50% Adv ({formatINR(selectedEventTotal * 0.5)})
                          </button>
                          {selectedEventBalance > 0 && (
                            <button
                              type="button"
                              onClick={() => applyPresetPercentage(100)}
                              className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-900 hover:bg-emerald-100 transition"
                            >
                              Full Balance ({formatINR(selectedEventBalance)})
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9a6c37]">
                        ₹
                      </span>
                      <input
                        type="number"
                        required
                        min="1"
                        step="1"
                        placeholder="e.g. 50000"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-sm font-bold text-gray-900 outline-none focus:border-[#9a6c37]"
                      />
                    </div>

                    {/* Dynamic calculation preview */}
                    {Number(paymentAmount) > 0 && selectedEventTotal > 0 && (
                      <div className="mt-2 flex items-center justify-between rounded-xl bg-white p-2.5 text-xs border border-[#eee7dc]">
                        <span className="text-gray-500 font-medium">
                          New Balance After Payment:
                        </span>
                        <span
                          className={`font-black ${
                            selectedEventBalance - Number(paymentAmount) <= 0
                              ? "text-emerald-600"
                              : "text-amber-700"
                          }`}
                        >
                          {formatINR(
                            Math.max(0, selectedEventBalance - Number(paymentAmount))
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-[#9a6c37]"
                    >
                      <option value="UPI / GPay">UPI / GPay / PhonePe / Paytm</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT / IMPS / RTGS</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit/Debit Card">Credit / Debit Card</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Transaction ID / Cheque # */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Transaction Reference / UPI Ref / Cheque No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI-30492810 / Cheque #000123"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  {/* Payment Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Payment Received Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#9a6c37]"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Payment Notes / Remarks (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Advance paid via UPI upon estimate confirmation..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-3 text-xs outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="h-10 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#29241f] px-5 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
                  >
                    {submittingPayment ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>Save Payment & Update Balance</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white p-6">
              <Loader2 className="h-7 w-7 animate-spin text-[#9a6c37]" />
              <p className="mt-2 text-xs font-bold text-gray-500">
                Fetching client events & financial records...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-xs font-bold text-rose-700">
              {error}
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <Receipt className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm font-bold text-gray-900">
                No Events or Bookings Found for this Client
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Once an estimate or booking is created for {client.name}, event & payment details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#9a6c37]">
                Client Events & Payment Breakdown ({events.length})
              </h3>

              {events.map((event) => {
                const booking: any = event.booking || {};
                const eventTotal = Number(booking.total || (event as any).total || 0);
                const paidAmount = Number(event.paidAmount || booking.paidAmount || 0);
                const advancePayment = Number(event.advancePayment || booking.advancePayment || 0);
                const balanceDue = Math.max(0, eventTotal - paidAmount);
                const history: any[] = event.paymentHistory || booking.paymentHistory || [];
                const bookingId = String(booking._id || event._id || "");
                const pctPaid = eventTotal > 0 ? Math.min(100, Math.round((paidAmount / eventTotal) * 100)) : 0;

                return (
                  <article
                    key={event._id}
                    className="overflow-hidden rounded-3xl border border-[#e8e1d8] bg-white shadow-sm transition hover:shadow-md"
                  >
                    {/* Event Header */}
                    <div className="border-b border-[#eee7dc] bg-[#faf8f5] p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#29241f] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                              {event.eventType}
                            </span>
                            <span className="rounded-md bg-white border border-[#e8e1d8] px-2 py-0.5 text-[10px] font-bold text-gray-700">
                              Status: {event.status}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                                balanceDue === 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : paidAmount > 0
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {pctPaid}% PAID
                            </span>
                          </div>

                          <h4 className="mt-2 text-base font-black text-[#29241f]">
                            {event.eventName}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-[#a7773f]" />
                              {new Date(event.eventDate).toLocaleDateString("en-IN", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={13} className="text-[#a7773f]" />
                              {event.eventTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-[#a7773f]" />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={13} className="text-[#a7773f]" />
                              {event.guests} Guests
                            </span>
                          </div>
                        </div>

                        {/* Action to Record Payment */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openPaymentForEvent(
                                bookingId,
                                paidAmount === 0
                                  ? "ADVANCE"
                                  : balanceDue === 0
                                  ? "FINAL_BALANCE"
                                  : "INSTALLMENT"
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-emerald-800"
                          >
                            <Plus size={14} />
                            <span>{paidAmount === 0 ? "+ Record Advance" : "+ Add Payment"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Event Financial Summary Pills */}
                      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#eee7dc] pt-3 text-xs sm:grid-cols-4">
                        <div className="rounded-xl bg-white border border-[#eee7dc] p-2.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Event Total</span>
                          <p className="mt-0.5 font-black text-gray-900">{formatINR(eventTotal)}</p>
                        </div>

                        <div className="rounded-xl bg-white border border-[#eee7dc] p-2.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Advance Paid</span>
                          <p className="mt-0.5 font-black text-amber-700">{formatINR(advancePayment)}</p>
                        </div>

                        <div className="rounded-xl bg-white border border-[#eee7dc] p-2.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Total Collected</span>
                          <p className="mt-0.5 font-black text-emerald-700">{formatINR(paidAmount)}</p>
                        </div>

                        <div className="rounded-xl bg-white border border-[#eee7dc] p-2.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Balance Outstanding</span>
                          <p className={`mt-0.5 font-black ${balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            {formatINR(balanceDue)}
                          </p>
                        </div>
                      </div>

                      {/* Mini Event Progress Bar */}
                      {eventTotal > 0 && (
                        <div className="mt-3">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-emerald-600 transition-all duration-300"
                              style={{ width: `${pctPaid}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment History Log Table */}
                    <div className="p-5">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <p className="text-xs font-bold text-[#29241f]">
                          Payment Transaction History ({history.length}):
                        </p>
                      </div>

                      {history.length === 0 ? (
                        <p className="py-3 text-center text-xs text-gray-400 italic">
                          No payment transactions recorded yet for this event. Click "+ Record Advance" above to log a payment.
                        </p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {history.map((tx: any, idx: number) => (
                            <div
                              key={tx._id || idx}
                              className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-[#faf9f6] p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                                  ✓
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-gray-900 text-sm">
                                      {formatINR(Number(tx.amount))}
                                    </span>
                                    <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-gray-600 border border-gray-200">
                                      {tx.paymentType || "PAYMENT"}
                                    </span>
                                    <span className="text-[11px] font-medium text-gray-500">
                                      via {tx.paymentMethod}
                                    </span>
                                  </div>

                                  {tx.transactionId && (
                                    <p className="mt-0.5 text-[10px] text-gray-400">
                                      Ref / Txn ID: <strong className="text-gray-700">{tx.transactionId}</strong>
                                    </p>
                                  )}
                                  {tx.notes && (
                                    <p className="mt-0.5 text-[11px] text-gray-600 italic">
                                      "{tx.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="text-right text-[11px] text-gray-500">
                                <span>
                                  {tx.paymentDate
                                    ? new Date(tx.paymentDate).toLocaleDateString("en-IN", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                    : "Recent"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

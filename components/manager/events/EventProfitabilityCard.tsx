"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  Loader2,
  PieChart,
  Plus,
  Receipt,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import {
  getEventProfitability,
  createExpense,
  deleteExpense,
  toggleExpenseStatus,
  type EventProfitabilityData,
} from "@/lib/expense.api";
import {
  expenseCategories,
  paymentMethods,
  type Expense,
  type ExpenseCategory,
  type PaymentMethod,
} from "@/components/manager/expenses/constants";
import { useAuth } from "@/hooks/useAuth";

interface EventProfitabilityCardProps {
  eventId: string;
  eventName: string;
}

export default function EventProfitabilityCard({
  eventId,
  eventName,
}: EventProfitabilityCardProps) {
  const { token } = useAuth();
  const [data, setData] = useState<EventProfitabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State for Logging Event Expense
  const [modalOpen, setModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState<ExpenseCategory>("Food");
  const [expAmount, setExpAmount] = useState<number | "">("");
  const [expPaymentMethod, setExpPaymentMethod] = useState<PaymentMethod>("UPI");
  const [expStatus, setExpStatus] = useState<"Paid" | "Pending">("Paid");
  const [expDescription, setExpDescription] = useState("");
  const [expDate, setExpDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const loadProfitability = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getEventProfitability(eventId, token || undefined);
      if (result) {
        setData(result);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load event profitability."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      void loadProfitability();
    }
  }, [eventId, token]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleCreateExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmount || Number(expAmount) <= 0) {
      setModalError("Please provide a valid title and expense amount.");
      return;
    }

    try {
      setSubmitting(true);
      setModalError("");

      await createExpense({
        title: expTitle.trim(),
        category: expCategory,
        amount: Number(expAmount),
        event: eventName,
        eventId,
        date: expDate,
        paymentMethod: expPaymentMethod,
        status: expStatus,
        description: expDescription.trim(),
      });

      showToast("Expense logged successfully!");
      setModalOpen(false);
      setExpTitle("");
      setExpAmount("");
      setExpDescription("");
      await loadProfitability();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Failed to log expense."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (expenseId: string) => {
    try {
      await toggleExpenseStatus(expenseId);
      await loadProfitability();
      showToast("Payment status updated!");
    } catch (err) {
      console.warn("Failed to toggle status", err);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Delete this expense record?")) return;
    try {
      await deleteExpense(expenseId);
      await loadProfitability();
      showToast("Expense removed.");
    } catch (err) {
      console.warn("Failed to delete expense", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-[#e8e1d8] bg-white p-8">
        <Loader2 className="h-7 w-7 animate-spin text-[#9a6c37]" />
        <p className="mt-3 text-xs font-bold text-gray-500">
          Calculating revenue, catering costs, and profit margins...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-xs text-red-700">
        <AlertCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
        <p className="font-bold">{error || "Failed to load profitability data."}</p>
        <button
          type="button"
          onClick={loadProfitability}
          className="mt-3 rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { revenue, expenses, profitability } = data;
  const isHealthy = profitability.healthStatus === "HEALTHY";
  const isModerate = profitability.healthStatus === "MODERATE";
  const isRisk = profitability.healthStatus === "RISK";

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Financial Analytics Card */}
      <section className="overflow-hidden rounded-3xl border border-[#e8e1d8] bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[#f1ece5] bg-gradient-to-r from-[#faf8f5] to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9a6c37]">
              <TrendingUp size={15} />
              <span>Event Financial Intelligence & Profitability</span>
            </div>
            <h3 className="mt-1 text-xl font-black tracking-tight text-[#29241f]">
              Profit & Margin Breakdown
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                isHealthy
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isModerate
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {isHealthy && "🟢 Healthy Margin (≥30%)"}
              {isModerate && "🟡 Moderate Margin (15-29%)"}
              {isRisk && "🔴 Margin At Risk (<15%)"}
            </span>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#29241f] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-black"
            >
              <Plus size={14} />
              Log Expense
            </button>
          </div>
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-2 gap-px bg-[#f1ece5] sm:grid-cols-4">
          <div className="bg-white p-5 text-center sm:text-left">
            <p className="text-[10px] font-extrabold uppercase text-gray-400">
              Total Invoiced Revenue
            </p>
            <p className="mt-1.5 text-xl font-black text-[#29241f] sm:text-2xl">
              ₹{revenue.total.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-gray-500">
              From client booking
            </p>
          </div>

          <div className="bg-white p-5 text-center sm:text-left">
            <p className="text-[10px] font-extrabold uppercase text-gray-400">
              Total Direct Costs
            </p>
            <p className="mt-1.5 text-xl font-black text-red-600 sm:text-2xl">
              ₹{expenses.total.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-gray-500">
              {expenses.count} logged expenses
            </p>
          </div>

          <div className="bg-white p-5 text-center sm:text-left">
            <p className="text-[10px] font-extrabold uppercase text-gray-400">
              Net Operating Profit
            </p>
            <p
              className={`mt-1.5 text-xl font-black sm:text-2xl ${
                profitability.netProfit >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {profitability.netProfit >= 0 ? "+" : ""}₹
              {profitability.netProfit.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-gray-500">
              Revenue - Costs
            </p>
          </div>

          <div className="bg-white p-5 text-center sm:text-left">
            <p className="text-[10px] font-extrabold uppercase text-gray-400">
              Profit Margin
            </p>
            <p
              className={`mt-1.5 text-xl font-black sm:text-2xl ${
                isHealthy
                  ? "text-emerald-600"
                  : isModerate
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {profitability.profitMargin}%
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-gray-500">
              Operating efficiency
            </p>
          </div>
        </div>

        {/* Catering vs. Services Streams Comparison */}
        <div className="grid gap-4 border-t border-[#f1ece5] p-5 sm:grid-cols-2 sm:p-6">
          {/* Catering Stream Financials */}
          <div className="rounded-2xl border border-[#ede6dc] bg-[#faf8f5] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-base">
                  🍽️
                </span>
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-[#29241f]">
                    Catering Financials
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Food & Beverage Menu Stream
                  </p>
                </div>
              </div>

              <span className="rounded-md bg-white px-2 py-0.5 text-xs font-black text-[#9a6c37] border border-[#ede6dc]">
                {profitability.cateringMargin}% Margin
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-200/60 pt-3 text-center">
              <div>
                <p className="text-[10px] font-bold text-gray-400">Invoiced</p>
                <p className="mt-0.5 text-xs font-extrabold text-[#29241f]">
                  ₹{revenue.cateringRevenue.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400">Food Cost</p>
                <p className="mt-0.5 text-xs font-extrabold text-red-600">
                  ₹{expenses.cateringExpenses.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400">Net Profit</p>
                <p className="mt-0.5 text-xs font-extrabold text-emerald-600">
                  ₹{profitability.cateringProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Production Services Stream Financials */}
          <div className="rounded-2xl border border-[#ede6dc] bg-[#faf8f5] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-base">
                  🎨
                </span>
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-[#29241f]">
                    Services Financials
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Decor, AV, Sound, Media & Logistics
                  </p>
                </div>
              </div>

              <span className="rounded-md bg-white px-2 py-0.5 text-xs font-black text-[#9a6c37] border border-[#ede6dc]">
                {profitability.servicesMargin}% Margin
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-200/60 pt-3 text-center">
              <div>
                <p className="text-[10px] font-bold text-gray-400">Invoiced</p>
                <p className="mt-0.5 text-xs font-extrabold text-[#29241f]">
                  ₹{revenue.servicesRevenue.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400">Prod. Cost</p>
                <p className="mt-0.5 text-xs font-extrabold text-red-600">
                  ₹{expenses.servicesExpenses.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400">Net Profit</p>
                <p className="mt-0.5 text-xs font-extrabold text-emerald-600">
                  ₹{profitability.servicesProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Category Distribution Bar */}
        {expenses.total > 0 && (
          <div className="border-t border-[#f1ece5] px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between text-xs">
              <p className="font-extrabold uppercase tracking-wider text-[#9b938a] text-[10px]">
                Expense Category Distribution
              </p>
              <p className="font-bold text-gray-500">
                ₹{expenses.paid.toLocaleString()} Paid · ₹{expenses.pending.toLocaleString()} Pending
              </p>
            </div>

            {/* Stacked Percentage Bar */}
            <div className="mt-2.5 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
              {expenses.distribution
                .filter((d) => d.amount > 0)
                .map((d, i) => (
                  <div
                    key={d.category}
                    title={`${d.category}: ₹${d.amount.toLocaleString()} (${d.percentage}%)`}
                    style={{ width: `${d.percentage}%` }}
                    className={`${getCategoryColor(d.category)} transition-all`}
                  />
                ))}
            </div>

            {/* Legend Pills */}
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold">
              {expenses.distribution
                .filter((d) => d.amount > 0)
                .map((d) => (
                  <span
                    key={d.category}
                    className="flex items-center gap-1.5 rounded-lg bg-[#faf8f5] px-2 py-1 text-gray-700 border border-gray-200"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${getCategoryColor(
                        d.category
                      )}`}
                    />
                    <span>{d.category}:</span>
                    <span className="text-[#29241f]">
                      ₹{d.amount.toLocaleString()} ({d.percentage}%)
                    </span>
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Logged Expenses Table */}
        <div className="border-t border-[#f1ece5] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#29241f]">
              Logged Event Expenses ({expenses.list.length})
            </h4>
          </div>

          {expenses.list.length === 0 ? (
            <p className="rounded-2xl bg-[#faf8f5] p-4 text-center text-xs text-gray-500">
              No expenses recorded for this event yet. Tap <strong>Log Expense</strong> to track vendor receipts, staff payouts, or supply bills.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-[#eee7dc]">
              {expenses.list.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col gap-2 bg-white p-3 sm:flex-row sm:items-center sm:justify-between transition hover:bg-[#faf8f5]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#29241f] truncate">
                        {expense.title}
                      </span>
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                        {expense.category}
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {expense.date} · via {expense.paymentMethod}
                      {expense.description ? ` · ${expense.description}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-red-600">
                      -₹{Number(expense.amount).toLocaleString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(expense.id)}
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold transition ${
                        expense.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      {expense.status}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      aria-label="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Log Event Expense Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl border border-[#e8e1d8] bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#9a6c37]">
                  Cost Center · {eventName}
                </p>
                <h3 className="text-lg font-black text-[#29241f]">
                  Record Event Expense
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateExpenseSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Flowers & Stage Backdrop Bill"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Category *
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#9a6c37]"
                  >
                    {expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 15000"
                    value={expAmount}
                    onChange={(e) =>
                      setExpAmount(e.target.value ? Number(e.target.value) : "")
                    }
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Payment Method
                  </label>
                  <select
                    value={expPaymentMethod}
                    onChange={(e) =>
                      setExpPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#9a6c37]"
                  >
                    {paymentMethods.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Status
                  </label>
                  <select
                    value={expStatus}
                    onChange={(e) =>
                      setExpStatus(e.target.value as "Paid" | "Pending")
                    }
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#9a6c37]"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Notes / Vendor Details (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Vendor name, bill number, receipt notes..."
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-11 flex-1 rounded-xl border border-gray-200 font-bold text-xs text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#29241f] font-bold text-xs text-white hover:bg-black disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {submitting ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryColor(category = "") {
  switch (category) {
    case "Food":
      return "bg-amber-500";
    case "Decoration":
      return "bg-purple-500";
    case "Equipment":
      return "bg-blue-500";
    case "Staff":
      return "bg-emerald-500";
    case "Transport":
      return "bg-indigo-500";
    case "Venue":
      return "bg-rose-500";
    default:
      return "bg-gray-400";
  }
}

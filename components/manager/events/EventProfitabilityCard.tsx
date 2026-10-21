"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  getEventProfitability,
  type EventProfitabilityData,
} from "@/lib/expense.api";
import { useAuth } from "@/hooks/useAuth";
import UnifiedExpensesSection from "@/components/manager/expenses/UnifiedExpensesSection";

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

  if (loading && !data) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-[#e8e1d8] bg-white p-8">
        <Loader2 className="h-7 w-7 animate-spin text-[#9a6c37]" />
        <p className="mt-3 text-xs font-bold text-gray-500">
          Calculating revenue, catering costs, and profit margins...
        </p>
      </div>
    );
  }

  if (error && !data) {
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

  const expenses = data?.expenses || { total: 0, count: 0 };
  const profitability = data?.profitability || { netProfit: 0 };

  return (
    <div className="space-y-6">
      {/* Main Financial Analytics Card */}
      <section className="overflow-hidden rounded-3xl border border-[#e8e1d8] bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-[#f1ece5] bg-gradient-to-r from-[#faf8f5] to-white p-5 sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
             
              <h3 className="text-lg font-black tracking-tight text-[#29241f] sm:text-xl">
                Event Expenses
              </h3>
            </div>
            <p className="text-xs text-[#756d64]">
              Scope: <strong className="text-[#29241f]">{eventName}</strong>
            </p>
          </div>
        </div>

        {/* 2 Main KPI Cards */}
        <div className="grid grid-cols-1 gap-px bg-[#f1ece5] sm:grid-cols-2">
          <div className="bg-white p-5 text-center sm:text-left">
            <p className="text-[10px] font-extrabold uppercase text-gray-400">
              Total Direct Costs
            </p>
            <p className="mt-1.5 text-xl font-black text-red-600 sm:text-2xl">
              ₹{expenses.total.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-gray-500">
              {expenses.count} logged operational expense{expenses.count !== 1 ? "s" : ""}
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
              Revenue - All Operating Costs
            </p>
          </div>
        </div>

        {/* Unified Department-wise Operational Expenses Section (Includes Automated Staff Duty Payroll) */}
        <div className="border-t border-[#f1ece5] p-5 sm:p-6">
          <UnifiedExpensesSection
            eventId={eventId}
            eventName={eventName}
            staffPayroll={data?.staffPayroll}
            onExpenseChange={loadProfitability}
            showHeader={false}
            showStats={false}
          />
        </div>
      </section>
    </div>
  );
}

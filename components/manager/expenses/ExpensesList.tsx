"use client";

import { useMemo } from "react";
import { Receipt, CheckCircle2, Clock3, Layers } from "lucide-react";

import type { Expense } from "./constants";
import ExpenseCard from "./ExpenseCard";

interface ExpensesListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onViewReceipt?: (expense: Expense) => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function ExpensesList({
  expenses,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewReceipt,
  hasFilters = false,
  onClearFilters,
}: ExpensesListProps) {
  const { paidCount, pendingCount, totalSum } = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let sum = 0;

    expenses.forEach((e) => {
      sum += Number(e.amount) || 0;
      if (e.status === "Paid") paid++;
      else pending++;
    });

    return { paidCount: paid, pendingCount: pending, totalSum: sum };
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[#d9d0c7] bg-white px-5 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe4] text-[#a7773f]">
          <Receipt size={22} />
        </div>

        <h3 className="mt-4 text-base font-semibold text-[#29241f]">
          {hasFilters
            ? "No expenses found for the selected filters"
            : "No operational expenses recorded yet"}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#756d64]">
          {hasFilters
            ? "No matching records found for the current staff, department/category, date range, or search criteria. Try adjusting your filters or resetting them."
            : "No operational expenses have been logged for this view yet. Click Add Expense to record supplier invoices, transport bills, or equipment rentals."}
        </p>

        {hasFilters && onClearFilters && (
          <div className="mt-4">
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-4 py-2 text-xs font-semibold text-[#a7773f] hover:bg-[#f7efe4] transition shadow-2xs"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-3.5">
      {/* List Header & Quick Summary */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={17} className="text-[#a7773f]" />
        
          </div>
          <p className="text-xs text-[#756d64] mt-0.5">
            Showing <strong className="text-[#29241f]">{expenses.length}</strong> record{expenses.length !== 1 ? "s" : ""} • Total: <strong className="text-[#29241f]">{formatCurrency(totalSum)}</strong>
          </p>
        </div>

        {/* Status Breakdown Pills */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#edf5ed] px-2.5 py-0.5 text-[11px] font-bold text-[#2e7d32] border border-[#c8e6c9]">
            <CheckCircle2 size={11} />
            <span>{paidCount} Paid</span>
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff8e1] px-2.5 py-0.5 text-[11px] font-bold text-[#b78103] border border-[#ffe082]">
            <Clock3 size={11} />
            <span>{pendingCount} Pending</span>
          </span>
        </div>
      </div>

      {/* Streamlined Cards Stack */}
      <div className="flex flex-col gap-2.5">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            onViewReceipt={onViewReceipt}
          />
        ))}
      </div>
    </section>
  );
}
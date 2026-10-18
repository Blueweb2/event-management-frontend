"use client";

import { useMemo } from "react";
import { Receipt, CheckCircle2, Clock3 } from "lucide-react";

import type { Expense } from "./constants";
import ExpenseCard from "./ExpenseCard";

interface ExpensesListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
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
}: ExpensesListProps) {
  const { paidCount, pendingCount, totalSum } = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let sum = 0;

    expenses.forEach((e) => {
      sum += e.amount;
      if (e.status === "Paid") paid++;
      else pending++;
    });

    return { paidCount: paid, pendingCount: pending, totalSum: sum };
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[#d9d0c7] bg-white px-5 py-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe4] text-[#a7773f]">
          <Receipt size={21} />
        </div>

        <h3 className="mt-4 text-base font-semibold text-[#29241f]">
          No expenses found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756d64]">
          Try changing your filters or add a new expense.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {/* List Header & Quick Summary */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-[#29241f]">
            Expense Records
          </h2>
          <p className="text-xs text-[#9b938a]">
            Showing {expenses.length} expense{expenses.length !== 1 ? "s" : ""} • Total: {formatCurrency(totalSum)}
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

      {/* Streamlined Small Long Cards Stack */}
      <div className="flex flex-col gap-2.5">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </section>
  );
}
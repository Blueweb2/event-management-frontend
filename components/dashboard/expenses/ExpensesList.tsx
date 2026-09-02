"use client";

import { Receipt } from "lucide-react";

import type { Expense } from "./constants";
import ExpenseCard from "./ExpenseCard";

interface ExpensesListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function ExpensesList({
  expenses,
  onEdit,
  onDelete,
  onToggleStatus,
}: ExpensesListProps) {
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
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#29241f]">
            Expense Records
          </h2>

          <p className="mt-1 text-sm text-[#9b938a]">
            {expenses.length} expense
            {expenses.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
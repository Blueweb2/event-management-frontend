"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import {
  expenseCategories,
  expenseStatuses,
  paymentMethods,
  type ExpenseCategory,
  type ExpenseStatus,
  type PaymentMethod,
} from "./constants";

interface ExpensesFiltersProps {
  search: string;
  category: ExpenseCategory | "All";
  paymentMethod: PaymentMethod | "All";
  status: ExpenseStatus | "All";
  onSearchChange: (value: string) => void;
  onCategoryChange: (
    value: ExpenseCategory | "All"
  ) => void;
  onPaymentMethodChange: (
    value: PaymentMethod | "All"
  ) => void;
  onStatusChange: (
    value: ExpenseStatus | "All"
  ) => void;
  onClear: () => void;
}

export default function ExpensesFilters({
  search,
  category,
  paymentMethod,
  status,
  onSearchChange,
  onCategoryChange,
  onPaymentMethodChange,
  onStatusChange,
  onClear,
}: ExpensesFiltersProps) {
  const hasFilters =
    search ||
    category !== "All" ||
    paymentMethod !== "All" ||
    status !== "All";

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal
          size={17}
          className="text-[#a7773f]"
        />

        <h2 className="text-sm font-semibold text-[#403a34]">
          Filter Expenses
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b938a]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search expenses..."
            className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] pl-10 pr-3 text-sm text-[#29241f] outline-none transition placeholder:text-[#aaa198] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
          />
        </div>

        <select
          value={category}
          onChange={(event) =>
            onCategoryChange(
              event.target.value as ExpenseCategory | "All"
            )
          }
          className="h-11 rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
        >
          <option value="All">All Categories</option>

          {expenseCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={paymentMethod}
          onChange={(event) =>
            onPaymentMethodChange(
              event.target.value as PaymentMethod | "All"
            )
          }
          className="h-11 rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
        >
          <option value="All">All Payment Methods</option>

          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target.value as ExpenseStatus | "All"
            )
          }
          className="h-11 rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
        >
          <option value="All">All Statuses</option>

          {expenseStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9a6c37] hover:text-[#7d5428]"
          >
            <X size={15} />
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
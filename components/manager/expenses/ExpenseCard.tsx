"use client";

import {
  CalendarDays,
  CreditCard,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import type { Expense } from "./constants";

interface ExpenseCardProps {
  expense: Expense;
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

export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onToggleStatus,
}: ExpenseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isPaid = expense.status === "Paid";

  return (
    <article className="relative rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#f7efe4] px-2.5 py-1 text-xs font-semibold text-[#9a6c37]">
              {expense.category}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isPaid
                  ? "bg-[#edf5ed] text-[#557555]"
                  : "bg-[#fff5e8] text-[#a36b28]"
              }`}
            >
              {expense.status}
            </span>
          </div>

          <h3 className="mt-3 truncate text-base font-semibold text-[#29241f]">
            {expense.title}
          </h3>

          <p className="mt-1 text-xs text-[#9b938a]">
            {expense.id}
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Expense actions"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#9b938a] transition hover:bg-[#f7f2ec] hover:text-[#403a34]"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-10 w-36 overflow-hidden rounded-xl border border-[#e8e1d8] bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(expense);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#403a34] hover:bg-[#f8f4ee]"
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(expense.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#a45145] hover:bg-[#fff5f3]"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-[#fbf6ef] p-4">
        <p className="text-xs font-medium text-[#9b938a]">
          Amount
        </p>

        <p className="mt-1 text-2xl font-bold text-[#29241f]">
          {formatCurrency(expense.amount)}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-3">
          <MapPin
            size={16}
            className="mt-0.5 shrink-0 text-[#a7773f]"
          />

          <div className="min-w-0">
            <p className="text-xs text-[#9b938a]">Event</p>
            <p className="truncate text-sm font-medium text-[#403a34]">
              {expense.event}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CalendarDays
            size={16}
            className="shrink-0 text-[#a7773f]"
          />

          <div>
            <p className="text-xs text-[#9b938a]">Date</p>
            <p className="text-sm font-medium text-[#403a34]">
              {expense.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CreditCard
            size={16}
            className="shrink-0 text-[#a7773f]"
          />

          <div>
            <p className="text-xs text-[#9b938a]">Payment Method</p>
            <p className="text-sm font-medium text-[#403a34]">
              {expense.paymentMethod}
            </p>
          </div>
        </div>
      </div>

      {expense.description && (
        <p className="mt-5 border-t border-[#eee8e1] pt-4 text-sm leading-6 text-[#756d64]">
          {expense.description}
        </p>
      )}

      <button
        type="button"
        onClick={() => onToggleStatus(expense.id)}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ded5cb] bg-white px-4 py-2.5 text-sm font-semibold text-[#403a34] transition hover:border-[#cdbba5] hover:bg-[#f8f4ee]"
      >
        <Wallet size={15} />

        {isPaid
          ? "Mark as Pending"
          : "Mark as Paid"}
      </button>
    </article>
  );
}
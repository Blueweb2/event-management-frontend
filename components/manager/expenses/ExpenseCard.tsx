"use client";

import {
  CalendarDays,
  CreditCard,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock3,
  Utensils,
  Sparkles,
  Users,
  Truck,
  Building2,
  Package,
  Receipt,
  RotateCcw,
} from "lucide-react";

import type { Expense, ExpenseCategory } from "./constants";

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

const getCategoryConfig = (category: ExpenseCategory) => {
  switch (category) {
    case "Food":
      return {
        icon: Utensils,
        bg: "bg-orange-50 text-orange-700 border-orange-200/80",
        badge: "bg-orange-50 text-orange-700",
      };
    case "Decoration":
      return {
        icon: Sparkles,
        bg: "bg-purple-50 text-purple-700 border-purple-200/80",
        badge: "bg-purple-50 text-purple-700",
      };
    case "Staff":
      return {
        icon: Users,
        bg: "bg-blue-50 text-blue-700 border-blue-200/80",
        badge: "bg-blue-50 text-blue-700",
      };
    case "Transport":
      return {
        icon: Truck,
        bg: "bg-cyan-50 text-cyan-700 border-cyan-200/80",
        badge: "bg-cyan-50 text-cyan-700",
      };
    case "Venue":
      return {
        icon: Building2,
        bg: "bg-amber-50 text-amber-800 border-amber-200/80",
        badge: "bg-amber-50 text-amber-800",
      };
    case "Equipment":
      return {
        icon: Package,
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        badge: "bg-emerald-50 text-emerald-700",
      };
    default:
      return {
        icon: Receipt,
        bg: "bg-[#f7efe4] text-[#9a6c37] border-[#e8ded0]",
        badge: "bg-[#f7efe4] text-[#9a6c37]",
      };
  }
};

export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onToggleStatus,
}: ExpenseCardProps) {
  const isPaid = expense.status === "Paid";
  const catConfig = getCategoryConfig(expense.category);
  const CategoryIcon = catConfig.icon;

  return (
    <article className="group relative flex flex-col justify-between gap-3 rounded-2xl border border-[#e8e1d8] bg-white p-3.5 shadow-xs transition-all hover:border-[#b8894b]/60 hover:shadow-sm md:flex-row md:items-center">
      {/* ========================================================
          LEFT: Category Icon & Main Expense Details
      ======================================================== */}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {/* Category Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${catConfig.bg}`}
          title={expense.category}
        >
          <CategoryIcon size={18} />
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          {/* Top Line: Title + Category Pill + Expense ID */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-[#29241f]">
              {expense.title}
            </h3>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${catConfig.badge}`}
            >
              {expense.category}
            </span>

            <span className="font-mono text-[10px] text-gray-400">
              #{expense.id}
            </span>
          </div>

          {/* Sub Line: Event + Date + Payment Method + Notes Preview */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#756d64]">
            {/* Event */}
            <div className="flex min-w-0 items-center gap-1">
              <MapPin size={12} className="shrink-0 text-[#a7773f]" />
              <span className="truncate max-w-[170px] sm:max-w-[220px] font-medium text-gray-700">
                {expense.event}
              </span>
            </div>

            <span className="text-gray-300">•</span>

            {/* Date */}
            <div className="flex items-center gap-1 text-gray-500">
              <CalendarDays size={12} className="shrink-0 text-gray-400" />
              <span>{expense.date}</span>
            </div>

            <span className="text-gray-300">•</span>

            {/* Payment Method */}
            <div className="flex items-center gap-1 text-gray-500">
              <CreditCard size={12} className="shrink-0 text-gray-400" />
              <span>{expense.paymentMethod}</span>
            </div>

            {/* Truncated description if present */}
            {expense.description && (
              <>
                <span className="hidden text-gray-300 xl:inline">•</span>
                <span
                  className="hidden max-w-xs truncate text-[11px] italic text-gray-400 xl:inline"
                  title={expense.description}
                >
                  &ldquo;{expense.description}&rdquo;
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT: Status Badge, Amount & Quick Action Controls
      ======================================================== */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-2.5 md:border-t-0 md:pt-0">
        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
            isPaid
              ? "bg-[#edf5ed] text-[#2e7d32] border border-[#c8e6c9]"
              : "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]"
          }`}
        >
          {isPaid ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
          <span>{expense.status}</span>
        </span>

        {/* Amount */}
        <div className="min-w-[90px] text-right">
          <p className="text-base font-extrabold text-[#29241f] sm:text-lg tabular-nums">
            {formatCurrency(expense.amount)}
          </p>
        </div>

        {/* Quick Action Button Group */}
        <div className="flex items-center gap-1">
          {/* Status Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleStatus(expense.id)}
            title={isPaid ? "Mark as Pending" : "Mark as Paid"}
            aria-label={isPaid ? "Mark as Pending" : "Mark as Paid"}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
              isPaid
                ? "border-gray-200 bg-gray-50 text-gray-600 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {isPaid ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(expense)}
            title="Edit expense"
            aria-label="Edit expense"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <Pencil size={14} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(expense.id)}
            title="Delete expense"
            aria-label="Delete expense"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
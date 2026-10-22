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
  User,
  Store,
  FileCheck2,
} from "lucide-react";

import type { Expense, ExpenseCategory } from "./constants";
import { formatTime24to12 } from "@/lib/time-utils";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onViewReceipt?: (expense: Expense) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const getCategoryConfig = (category: string) => {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("food") || normalized.includes("cater")) {
    return {
      icon: Utensils,
      bg: "bg-orange-50 text-orange-700 border-orange-200/80",
      badge: "bg-orange-50 text-orange-700 border border-orange-200",
    };
  }
  if (normalized.includes("decor")) {
    return {
      icon: Sparkles,
      bg: "bg-purple-50 text-purple-700 border-purple-200/80",
      badge: "bg-purple-50 text-purple-700 border border-purple-200",
    };
  }
  if (normalized.includes("staff")) {
    return {
      icon: Users,
      bg: "bg-blue-50 text-blue-700 border-blue-200/80",
      badge: "bg-blue-50 text-blue-700 border border-blue-200",
    };
  }
  if (normalized.includes("transport")) {
    return {
      icon: Truck,
      bg: "bg-cyan-50 text-cyan-700 border-cyan-200/80",
      badge: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    };
  }
  if (normalized.includes("venue")) {
    return {
      icon: Building2,
      bg: "bg-amber-50 text-amber-800 border-amber-200/80",
      badge: "bg-amber-50 text-amber-800 border border-amber-200",
    };
  }
  if (normalized.includes("equip")) {
    return {
      icon: Package,
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
  }
  if (normalized.includes("clean")) {
    return {
      icon: Sparkles,
      bg: "bg-teal-50 text-teal-700 border-teal-200/80",
      badge: "bg-teal-50 text-teal-700 border border-teal-200",
    };
  }
  return {
    icon: Receipt,
    bg: "bg-[#f7efe4] text-[#9a6c37] border-[#e8ded0]",
    badge: "bg-[#f7efe4] text-[#9a6c37] border border-[#e8ded0]",
  };
};

export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewReceipt,
}: ExpenseCardProps) {
  const isPaid = expense.status === "Paid";
  const catConfig = getCategoryConfig(expense.category);
  const CategoryIcon = catConfig.icon;
  const hasAttachment = Boolean(expense.hasReceipt || expense.receiptPath);
  const addedByName =
    expense.createdByName ||
    (typeof expense.createdBy === "object" ? expense.createdBy?.name : "") ||
    "Staff / Admin";

  return (
    <article className="group relative flex flex-col justify-between gap-3.5 rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs transition-all hover:border-[#b8894b]/60 hover:shadow-sm md:flex-row md:items-center">
      {/* ========================================================
          LEFT: Category Icon & Main Expense Details
      ======================================================== */}
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        {/* Category Icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${catConfig.bg}`}
          title={expense.category}
        >
          <CategoryIcon size={20} />
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          {/* Top Line: Title + Category Badge + Ref ID + Vendor / Duty Details */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-[#29241f]">
              {expense.isAutomatedPayroll ? (expense.staffName || expense.title) : expense.title}
            </h3>

        

            {/* Automated Payroll Badge */}
       

            {/* Duty Title / Role */}
            {expense.isAutomatedPayroll && expense.dutyRole && (
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                {expense.dutyRole}
              </span>
            )}

            {/* Department */}
          


          </div>

          {/* Sub Line: Event + Date + Shift Times / Added By + Payment Method */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#756d64]">
            {/* Event */}
            <div className="flex min-w-0 items-center gap-1">
              <MapPin size={12} className="shrink-0 text-[#a7773f]" />
              <span className="truncate max-w-[170px] sm:max-w-[220px] font-medium text-gray-800">
                {expense.event}
              </span>
            </div>

            <span className="text-gray-300">•</span>

            {/* Date */}
            <div className="flex items-center gap-1 text-gray-600">
              <CalendarDays size={12} className="shrink-0 text-gray-400" />
              <span>{expense.date || "Scheduled Date"}</span>
            </div>

            {expense.isAutomatedPayroll ? (
              <>
                {(expense.startTime || expense.endTime || expense.hours || expense.hourlyRate) && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1 text-gray-600 font-medium">
                      <Clock3 size={12} className="shrink-0 text-gray-400" />
                      <span>
                        {expense.startTime && expense.endTime
                          ? `${formatTime24to12(expense.startTime)} - ${formatTime24to12(expense.endTime)}`
                          : ""}
                        {expense.hours && expense.hours > 0 ? ` · ${expense.hours} hrs` : ""}
                        {expense.hourlyRate && expense.hourlyRate > 0 ? ` @ ₹${expense.hourlyRate}/hr` : ""}
                      </span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <span className="text-gray-300">•</span>

                {/* Added By Badge */}
                <div className="flex items-center gap-1 font-medium text-gray-600">
                  <User size={12} className="shrink-0 text-[#b8894b]" />
                  <span>
                    Added by: <strong className="text-gray-800">{addedByName}</strong>
                  </span>
                </div>

                <span className="text-gray-300">•</span>

                {/* Payment Method */}
                <div className="flex items-center gap-1 text-gray-500">
                  <CreditCard size={12} className="shrink-0 text-gray-400" />
                  <span>{expense.paymentMethod}</span>
                </div>
              </>
            )}
          </div>

          {/* Description Snippet */}
          {expense.description && (
            <p
              className="mt-1 line-clamp-1 text-xs text-gray-500"
              title={expense.description}
            >
              &ldquo;{expense.description}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* ========================================================
          RIGHT: Receipt Button, Amount, Status & Controls
      ======================================================== */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 md:border-t-0 md:pt-0">
        {/* Receipt Attachment Indicator / Duty Shift Pill */}
        {expense.isAutomatedPayroll ? (
          <span
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-2.5 text-xs font-bold text-emerald-800"
            title="Auto-calculated staff duty shift"
          >
            <Users size={13} className="text-emerald-700" />
            <span>Duty Shift</span>
          </span>
        ) : hasAttachment ? (
          <button
            type="button"
            onClick={() => onViewReceipt?.(expense)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2.5 text-xs font-bold text-[#9a6c37] transition hover:bg-amber-100 hover:border-amber-300"
            title="View attached receipt document"
          >
            <FileCheck2 size={13} className="text-[#9a6c37]" />
            <span>View Receipt</span>
          </button>
        ) : (
          <span className="text-[11px] font-medium text-gray-400 italic">
            No receipt attached
          </span>
        )}

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
        <div className="min-w-[95px] text-right">
          <p className="text-base font-extrabold text-[#29241f] sm:text-lg tabular-nums">
            {formatCurrency(expense.amount)}
          </p>
        </div>

        {/* Quick Action Button Group (Only for manual expenses to protect automated payroll data) */}
        {!expense.isAutomatedPayroll && (
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
        )}
      </div>
    </article>
  );
}
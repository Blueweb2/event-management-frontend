"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  expenseCategories,
  paymentMethods,
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
  type PaymentMethod,
} from "./constants";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  editingExpense?: Expense | null;
}

const emptyExpense: Expense = {
  id: "",
  title: "",
  category: "Food",
  amount: 0,
  event: "",
  date: "",
  paymentMethod: "UPI",
  status: "Pending",
  description: "",
};

export default function AddExpenseModal({
  open,
  onClose,
  onSave,
  editingExpense,
}: AddExpenseModalProps) {
  const [form, setForm] = useState<Expense>(emptyExpense);

  useEffect(() => {
    if (editingExpense) {
      setForm(editingExpense);
    } else {
      setForm(emptyExpense);
    }
  }, [editingExpense, open]);

  if (!open) return null;

  const updateField = <K extends keyof Expense>(
    field: K,
    value: Expense[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.event.trim() ||
      !form.date ||
      form.amount <= 0
    ) {
      return;
    }

    const expense: Expense = {
      ...form,
      id:
        editingExpense?.id ||
        `EXP-${Date.now().toString().slice(-6)}`,
      title: form.title.trim(),
      event: form.event.trim(),
      description: form.description.trim(),
    };

    onSave(expense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#29241f]/40 p-0 sm:items-center sm:p-5">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eee8e1] bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#29241f]">
              {editingExpense
                ? "Edit Expense"
                : "Add Expense"}
            </h2>

            <p className="mt-0.5 text-xs text-[#9b938a]">
              Record event-related spending.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#756d64] hover:bg-[#f7f2ec]"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
              Expense Title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              placeholder="e.g. Decoration Materials"
              className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
                Category
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target.value as ExpenseCategory
                  )
                }
                className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
              >
                {expenseCategories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
                Amount
              </label>

              <input
                type="number"
                min="1"
                value={form.amount || ""}
                onChange={(event) =>
                  updateField(
                    "amount",
                    Number(event.target.value)
                  )
                }
                placeholder="₹ 0"
                className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
              Event
            </label>

            <input
              type="text"
              value={form.event}
              onChange={(event) =>
                updateField("event", event.target.value)
              }
              placeholder="e.g. Wedding Celebration"
              className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
                Date
              </label>

              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  updateField("date", event.target.value)
                }
                className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
                Payment Method
              </label>

              <select
                value={form.paymentMethod}
                onChange={(event) =>
                  updateField(
                    "paymentMethod",
                    event.target.value as PaymentMethod
                  )
                }
                className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
              >
                {paymentMethods.map((method) => (
                  <option
                    key={method}
                    value={method}
                  >
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as ExpenseStatus
                )
              }
              className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Add a short description..."
              rows={4}
              className="w-full resize-none rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 py-3 text-sm outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#eee8e1] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-[#ded5cb] px-5 text-sm font-semibold text-[#403a34] hover:bg-[#f8f4ee]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-11 rounded-xl bg-[#b8894b] px-5 text-sm font-semibold text-white hover:bg-[#a7773f]"
            >
              {editingExpense
                ? "Save Changes"
                : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
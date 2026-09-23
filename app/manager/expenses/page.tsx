"use client";

import { useEffect, useMemo, useState } from "react";

import ExpensesHeader from "@/components/manager/expenses/ExpensesHeader";
import ExpensesStats from "@/components/manager/expenses/ExpensesStats";
import ExpensesFilters from "@/components/manager/expenses/ExpensesFilters";
import ExpensesList from "@/components/manager/expenses/ExpensesList";
import AddExpenseModal from "@/components/manager/expenses/AddExpenseModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import {
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
  type PaymentMethod,
} from "@/components/manager/expenses/constants";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  toggleExpenseStatus,
  updateExpense,
  type ExpensePayload,
} from "@/lib/expense.api";
import { getEvents } from "@/lib/event.api";

export default function ExpensesPage() {
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [eventOptions, setEventOptions] = useState<{ id: string; name: string }[]>([]);
  const [eventFilter, setEventFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState<
    ExpenseCategory | "All"
  >("All");

  const [paymentMethod, setPaymentMethod] = useState<
    PaymentMethod | "All"
  >("All");

  const [status, setStatus] = useState<
    ExpenseStatus | "All"
  >("All");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingExpense, setEditingExpense] =
    useState<Expense | null>(null);

  const [deletingExpenseId, setDeletingExpenseId] =
    useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      const [expenses, eventsRes] = await Promise.all([
        getExpenses(),
        getEvents({ limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setExpenseList(expenses);
      if (eventsRes && Array.isArray(eventsRes.data)) {
        setEventOptions(
          eventsRes.data.map((evt) => ({
            id: evt._id,
            name: evt.eventName,
          }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchExpenses(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedEventObj = eventOptions.find((e) => e.id === eventFilter);

    return expenseList.filter((expense) => {
      const matchesSearch =
        !query ||
        expense.title.toLowerCase().includes(query) ||
        expense.event.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.id.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" ||
        expense.category === category;

      const matchesPayment =
        paymentMethod === "All" ||
        expense.paymentMethod === paymentMethod;

      const matchesStatus =
        status === "All" ||
        expense.status === status;

      const matchesEvent =
        eventFilter === "All" ||
        expense.eventId === eventFilter ||
        (selectedEventObj &&
          expense.event.toLowerCase() === selectedEventObj.name.toLowerCase());

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPayment &&
        matchesStatus &&
        matchesEvent
      );
    });
  }, [
    expenseList,
    search,
    category,
    paymentMethod,
    status,
    eventFilter,
    eventOptions,
  ]);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleSaveExpense = async (expense: Expense) => {
    const payload: ExpensePayload = {
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      event: expense.event,
      eventId: expense.eventId || undefined,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      status: expense.status,
      description: expense.description,
    };

    if (editingExpense) await updateExpense(editingExpense.id, payload);
    else await createExpense(payload);
    await fetchExpenses();
  };

  const handleDeleteExpense = (id: string) => {
    setDeletingExpenseId(id);
  };

  const confirmDeleteExpense = async () => {
    if (!deletingExpenseId) return;

    await deleteExpense(deletingExpenseId);
    await fetchExpenses();
    setDeletingExpenseId(null);
  };

  const handleToggleStatus = async (id: string) => {
    await toggleExpenseStatus(id);
    await fetchExpenses();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setPaymentMethod("All");
    setStatus("All");
    setEventFilter("All");
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <ExpensesHeader
        onAddExpense={handleAddExpense}
      />

      {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600"><span>{error}</span><button type="button" onClick={() => void fetchExpenses()} className="ml-3 font-semibold underline">Retry</button></div>}

      <ExpensesStats expenses={expenseList} />

      <ExpensesFilters
        search={search}
        category={category}
        paymentMethod={paymentMethod}
        status={status}
        eventFilter={eventFilter}
        eventOptions={eventOptions}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onPaymentMethodChange={setPaymentMethod}
        onStatusChange={setStatus}
        onEventFilterChange={setEventFilter}
        onClear={clearFilters}
      />

      {loading ? <div className="rounded-2xl border border-[#e8e1d8] bg-white p-12 text-center text-sm text-[#756d64]">Loading expenses...</div> : <ExpensesList expenses={filteredExpenses} onEdit={handleEditExpense} onDelete={handleDeleteExpense} onToggleStatus={(id) => void handleToggleStatus(id)} />}

      <ConfirmDialog
        isOpen={Boolean(deletingExpenseId)}
        onClose={() => setDeletingExpenseId(null)}
        onConfirm={confirmDeleteExpense}
        title="Delete expense?"
        description="Are you sure you want to delete this expense?"
        confirmText="Delete expense"
      />

      <AddExpenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        events={eventOptions}
      />
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";

import ExpensesHeader from "@/components/dashboard/expenses/ExpensesHeader";
import ExpensesStats from "@/components/dashboard/expenses/ExpensesStats";
import ExpensesFilters from "@/components/dashboard/expenses/ExpensesFilters";
import ExpensesList from "@/components/dashboard/expenses/ExpensesList";
import AddExpenseModal from "@/components/dashboard/expenses/AddExpenseModal";

import {
  expenses as initialExpenses,
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
  type PaymentMethod,
} from "@/components/dashboard/expenses/constants";

export default function ExpensesPage() {
  const [expenseList, setExpenseList] =
    useState<Expense[]>(initialExpenses);

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

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

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

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPayment &&
        matchesStatus
      );
    });
  }, [
    expenseList,
    search,
    category,
    paymentMethod,
    status,
  ]);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleSaveExpense = (expense: Expense) => {
    setExpenseList((current) => {
      const exists = current.some(
        (item) => item.id === expense.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === expense.id ? expense : item
        );
      }

      return [expense, ...current];
    });
  };

  const handleDeleteExpense = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    setExpenseList((current) =>
      current.filter((expense) => expense.id !== id)
    );
  };

  const handleToggleStatus = (id: string) => {
    setExpenseList((current) =>
      current.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              status:
                expense.status === "Paid"
                  ? "Pending"
                  : "Paid",
            }
          : expense
      )
    );
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setPaymentMethod("All");
    setStatus("All");
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <ExpensesHeader
        onAddExpense={handleAddExpense}
      />

      <ExpensesStats />

      <ExpensesFilters
        search={search}
        category={category}
        paymentMethod={paymentMethod}
        status={status}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onPaymentMethodChange={setPaymentMethod}
        onStatusChange={setStatus}
        onClear={clearFilters}
      />

      <ExpensesList
        expenses={filteredExpenses}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        onToggleStatus={handleToggleStatus}
      />

      <AddExpenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
      />
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Layers, Receipt, RefreshCw } from "lucide-react";

import ExpensesHeader from "./ExpensesHeader";
import ExpensesStats from "./ExpensesStats";
import ExpensesFilters from "./ExpensesFilters";
import ExpensesList from "./ExpensesList";
import AddExpenseModal from "./AddExpenseModal";
import ReceiptViewerModal from "./ReceiptViewerModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import {
  matchesExpenseCategory,
  type Expense,
  type ExpenseCreator,
  type ExpenseStatus,
  type PaymentMethod,
} from "./constants";
import {
  createExpense,
  deleteExpense,
  getExpenseCreators,
  getExpenses,
  toggleExpenseStatus,
  updateExpense,
  type ExpensePayload,
  type EventProfitabilityData,
} from "@/lib/expense.api";
import { getEvents } from "@/lib/event.api";

interface UnifiedExpensesSectionProps {
  eventId?: string;
  eventName?: string;
  onExpenseChange?: () => void;
  showHeader?: boolean;
  showStats?: boolean;
  title?: string;
  subtitle?: string;
  staffPayroll?: EventProfitabilityData["staffPayroll"];
}

export default function UnifiedExpensesSection({
  eventId,
  eventName,
  onExpenseChange,
  showHeader = false,
  showStats = false,
  title = "Department-wise Operational Expenses",
  subtitle = "Track supplier invoices, vendor bills, and operational expenses with receipt verification.",
  staffPayroll,
}: UnifiedExpensesSectionProps) {
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [eventOptions, setEventOptions] = useState<{ id: string; name: string }[]>([]);
  const [creators, setCreators] = useState<ExpenseCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [addedBy, setAddedBy] = useState<string>("All");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "All">("All");
  const [status, setStatus] = useState<ExpenseStatus | "All">("All");
  const [eventFilter, setEventFilter] = useState("All");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<Expense | null>(null);

  const isEventScoped = Boolean(eventId);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      if (isEventScoped && eventId) {
        // Event-specific expenses & creators
        const [expenses, creatorsRes] = await Promise.all([
          getExpenses({ eventId }),
          getExpenseCreators(eventId).catch(() => []),
        ]);
        setExpenseList(expenses);
        if (Array.isArray(creatorsRes)) {
          setCreators(creatorsRes);
        }
      } else {
        // Global manager expenses
        const [expenses, eventsRes, creatorsRes] = await Promise.all([
          getExpenses(),
          getEvents({ limit: 100 }).catch(() => ({ data: [] })),
          getExpenseCreators().catch(() => []),
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

        if (Array.isArray(creatorsRes)) {
          setCreators(creatorsRes);
        }
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
  }, [eventId]);

  // Convert automated staff duty payroll records into unified expense entries
  const payrollExpenseList: Expense[] = useMemo(() => {
    if (!staffPayroll?.duties || staffPayroll.duties.length === 0) {
      return [];
    }

    return staffPayroll.duties.map((duty) => {
      let dateStr = "";
      if (duty.dutyDate) {
        try {
          const d = new Date(duty.dutyDate);
          if (!isNaN(d.getTime())) {
            dateStr = d.toISOString().split("T")[0];
          } else {
            dateStr = String(duty.dutyDate);
          }
        } catch {
          dateStr = String(duty.dutyDate);
        }
      }

      const isPaid = (duty.paymentStatus || "").toUpperCase() === "PAID";

      return {
        id: `DUTY-${duty.id}`,
        title: `${duty.staffName}${duty.role ? ` – ${duty.role}` : ""}`,
        category: "Staff",
        amount: Number(duty.amount) || 0,
        event: eventName || "Current Event",
        eventId: eventId,
        date: dateStr,
        paymentMethod: "Bank Transfer",
        status: isPaid ? "Paid" : "Pending",
        description: duty.department ? `Department: ${duty.department}` : "",
        createdByName: duty.staffName,
        isAutomatedPayroll: true,
        staffName: duty.staffName,
        dutyRole: duty.role,
        department: duty.department || "",
        startTime: duty.startTime,
        endTime: duty.endTime,
        hours: duty.hours,
        hourlyRate: duty.hourlyRate,
        dutyId: duty.id,
      };
    });
  }, [staffPayroll, eventName, eventId]);

  // Merge direct expenses and automated staff duty payroll entries
  const combinedExpenses = useMemo(() => {
    return [...expenseList, ...payrollExpenseList];
  }, [expenseList, payrollExpenseList]);

  // Merge manual expense creators with assigned duty staff members for staff filtering
  const staffFilterOptions: ExpenseCreator[] = useMemo(() => {
    const list = [...creators];
    const existingNames = new Set(
      list.map((c) => (c.name || c.username || "").toLowerCase().trim())
    );

    if (staffPayroll?.duties) {
      staffPayroll.duties.forEach((duty) => {
        const nameKey = (duty.staffName || "").toLowerCase().trim();
        if (nameKey && !existingNames.has(nameKey)) {
          existingNames.add(nameKey);
          list.push({
            id: `staff-${duty.staffName}`,
            _id: `staff-${duty.staffName}`,
            name: duty.staffName,
            role: duty.role || "Staff",
            department: duty.department || "",
          });
        }
      });
    }

    return list;
  }, [creators, staffPayroll]);

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(search.trim()) ||
      (category !== "All" && category !== "All Categories") ||
      (addedBy !== "All" && addedBy !== "All Staff") ||
      paymentMethod !== "All" ||
      status !== "All" ||
      (!isEventScoped && eventFilter !== "All")
    );
  }, [search, category, addedBy, paymentMethod, status, eventFilter, isEventScoped]);

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedEventObj = eventOptions.find((e) => e.id === eventFilter);

    return combinedExpenses.filter((expense) => {
      // 1. Search Query (description, vendor name, title, category, id, staff name, role, department)
      const matchesSearch =
        !query ||
        expense.title.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.id.toLowerCase().includes(query) ||
        (expense.event && expense.event.toLowerCase().includes(query)) ||
        (expense.vendorName && expense.vendorName.toLowerCase().includes(query)) ||
        (expense.description && expense.description.toLowerCase().includes(query)) ||
        (expense.staffName && expense.staffName.toLowerCase().includes(query)) ||
        (expense.dutyRole && expense.dutyRole.toLowerCase().includes(query)) ||
        (expense.department && expense.department.toLowerCase().includes(query)) ||
        (expense.isAutomatedPayroll && "automated payroll".includes(query));

      // 2. Department / Category Filter (with alias mapping, e.g. "Staff" includes both manual and duty payroll)
      const matchesCategory = matchesExpenseCategory(expense.category, category);

      // 3. Staff / Added By Filter
      let matchesAddedBy = addedBy === "All" || addedBy === "All Staff";
      if (!matchesAddedBy) {
        if (expense.isAutomatedPayroll) {
          const selectedStaff = staffFilterOptions.find(
            (c) => (c._id || c.id) === addedBy
          );
          const selectedName = (selectedStaff?.name || selectedStaff?.username || "").toLowerCase().trim();
          const expenseStaffName = (expense.staffName || "").toLowerCase().trim();
          matchesAddedBy =
            addedBy === `staff-${expense.staffName}` ||
            (Boolean(selectedName) && expenseStaffName === selectedName);
        } else {
          const creatorId =
            expense.createdBy && typeof expense.createdBy === "object"
              ? (expense.createdBy._id || expense.createdBy.id || "")
              : String(expense.createdBy || "");
          const selectedStaff = staffFilterOptions.find(
            (c) => (c._id || c.id) === addedBy
          );
          const selectedName = (selectedStaff?.name || selectedStaff?.username || "").toLowerCase().trim();
          const expenseCreatorName = (expense.createdByName || "").toLowerCase().trim();

          matchesAddedBy =
            creatorId === addedBy ||
            (Boolean(selectedName) && expenseCreatorName === selectedName);
        }
      }

      // 4. Payment Method & Status
      const matchesPayment =
        paymentMethod === "All" || expense.paymentMethod === paymentMethod;

      const matchesStatus =
        status === "All" || expense.status === status;

      // 5. Associated Event (only applicable in global mode)
      let matchesEvent = true;
      if (!isEventScoped && eventFilter !== "All") {
        matchesEvent =
          expense.eventId === eventFilter ||
          Boolean(
            selectedEventObj &&
              expense.event.toLowerCase() === selectedEventObj.name.toLowerCase()
          );
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAddedBy &&
        matchesPayment &&
        matchesStatus &&
        matchesEvent
      );
    });
  }, [
    combinedExpenses,
    search,
    category,
    addedBy,
    paymentMethod,
    status,
    eventFilter,
    eventOptions,
    isEventScoped,
    staffFilterOptions,
  ]);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleSaveExpense = async (
    expense: Expense,
    receiptFile: File | null,
    removeReceipt?: boolean
  ) => {
    const targetEventName = (isEventScoped ? eventName || expense.event : expense.event).trim();
    const targetEventId = isEventScoped ? eventId : expense.eventId;

    if (receiptFile || removeReceipt) {
      const formData = new FormData();
      formData.append("title", expense.title);
      formData.append("category", expense.category);
      formData.append("amount", String(expense.amount));
      formData.append("event", targetEventName);
      if (targetEventId) formData.append("eventId", targetEventId);
      formData.append("date", expense.date);
      formData.append("paymentMethod", expense.paymentMethod);
      formData.append("status", expense.status);
      formData.append("description", expense.description || "");
      if (expense.vendorName) formData.append("vendorName", expense.vendorName);
      if (receiptFile) formData.append("receipt", receiptFile);
      if (removeReceipt) formData.append("removeReceipt", "true");

      if (editingExpense) {
        await updateExpense(editingExpense.id, formData);
      } else {
        await createExpense(formData);
      }
    } else {
      const payload: ExpensePayload = {
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        event: targetEventName,
        eventId: targetEventId || undefined,
        date: expense.date,
        paymentMethod: expense.paymentMethod,
        status: expense.status,
        description: expense.description,
        vendorName: expense.vendorName || undefined,
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
      } else {
        await createExpense(payload);
      }
    }

    await fetchExpenses();
    onExpenseChange?.();
  };

  const handleDeleteExpense = (id: string) => {
    setDeletingExpenseId(id);
  };

  const confirmDeleteExpense = async () => {
    if (!deletingExpenseId) return;

    await deleteExpense(deletingExpenseId);
    await fetchExpenses();
    setDeletingExpenseId(null);
    onExpenseChange?.();
  };

  const handleToggleStatus = async (id: string) => {
    await toggleExpenseStatus(id);
    await fetchExpenses();
    onExpenseChange?.();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setAddedBy("All");
    setPaymentMethod("All");
    setStatus("All");
    setEventFilter("All");
  };

  return (
    <div className="space-y-5">
      {/* Optional Full Page Header (for global page) */}
      {showHeader ? (
        <ExpensesHeader onAddExpense={handleAddExpense} />
      ) : (
        /* Event-specific Compact Section Header */
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          
        </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchExpenses()}
              disabled={loading}
              title="Refresh expenses"
              aria-label="Refresh expenses"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#ded5cb] bg-white text-[#756d64] hover:bg-[#f7f2ec] transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={handleAddExpense}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#29241f] px-3.5 text-xs font-bold text-white shadow-xs transition hover:bg-black"
            >
              <Plus size={14} />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600 flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void fetchExpenses()}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Optional Global Stats Cards */}
      {showStats && <ExpensesStats expenses={combinedExpenses} />}

      {/* Dropdown Filters Toolbar */}
      <ExpensesFilters
        search={search}
        category={category}
        addedBy={addedBy}
        creators={staffFilterOptions}
        paymentMethod={paymentMethod}
        status={status}
        eventFilter={eventFilter}
        eventOptions={eventOptions}
        showEventFilter={!isEventScoped}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onAddedByChange={setAddedBy}
        onPaymentMethodChange={setPaymentMethod}
        onStatusChange={setStatus}
        onEventFilterChange={setEventFilter}
        onClear={clearFilters}
      />

      {/* Expenses List */}
      {loading ? (
        <div className="rounded-2xl border border-[#e8e1d8] bg-white p-12 text-center text-sm text-[#756d64]">
          Loading department operational expenses...
        </div>
      ) : (
        <ExpensesList
          expenses={filteredExpenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          onToggleStatus={(id) => void handleToggleStatus(id)}
          onViewReceipt={(expense) => setViewingReceiptExpense(expense)}
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingExpenseId)}
        onClose={() => setDeletingExpenseId(null)}
        onConfirm={confirmDeleteExpense}
        title="Delete expense?"
        description="Are you sure you want to delete this operational expense record? This action cannot be undone."
        confirmText="Delete expense"
      />

      {/* Add / Edit Expense with Receipt Upload */}
      <AddExpenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        events={eventOptions}
        fixedEvent={
          isEventScoped && eventId
            ? { id: eventId, name: eventName || "" }
            : undefined
        }
      />

      {/* Secure Receipt Document Viewer Modal */}
      <ReceiptViewerModal
        isOpen={Boolean(viewingReceiptExpense)}
        onClose={() => setViewingReceiptExpense(null)}
        expense={viewingReceiptExpense}
      />
    </div>
  );
}

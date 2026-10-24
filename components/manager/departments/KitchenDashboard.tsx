"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Utensils,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Loader2,
  ArrowRight,
  Package,
  ChefHat,
  Search,
  X,
  FileSpreadsheet,
  Printer,
  Trash2,
  Calculator,
  ShoppingCart,
  AlertCircle,
  StickyNote,
  Check,
  Flame,
  FileText,
  Info,
} from "lucide-react";

import {
  getKitchenEvents,
  calculateKitchenIngredients,
  getKitchenTasks,
  createKitchenTask,
  updateKitchenTaskStatus,
  deleteKitchenTask,
  createKitchenPurchaseRequest,
  getKitchenPurchaseRequests,
  type KitchenEventItem,
  type IngredientCalculationResult,
  type DepartmentTask,
  type PurchaseRequestRecord,
} from "@/lib/department.api";

interface KitchenDashboardProps {
  token: string;
}

interface KitchenNote {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export default function KitchenDashboard({ token }: KitchenDashboardProps) {
  const [events, setEvents] = useState<KitchenEventItem[]>([]);
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time filter for events: "ALL" | "TODAY" | "TOMORROW" | "THIS_WEEK"
  const [timeFilter, setTimeFilter] = useState<"ALL" | "TODAY" | "TOMORROW" | "THIS_WEEK">("ALL");
  const [eventSearch, setEventSearch] = useState("");

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedEventForTask, setSelectedEventForTask] = useState<string>("");
  const [taskCreating, setTaskCreating] = useState(false);

  // Daily Kitchen Sticky Notes (Whiteboard)
  const [kitchenNotes, setKitchenNotes] = useState<KitchenNote[]>([]);
  const [newNoteText, setNewNoteText] = useState("");

  // Kitchen Prep Slip Modal (Printable KOT)
  const [kitchenSlipEvent, setKitchenSlipEvent] = useState<KitchenEventItem | null>(null);

  // Simple Ingredient Calculator modal state
  const [calcModalEvent, setCalcModalEvent] = useState<KitchenEventItem | null>(null);
  const [calcResult, setCalcResult] = useState<IngredientCalculationResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [requestingShortages, setRequestingShortages] = useState(false);

  // Quick Grocery Order Modal state
  const [groceryModalOpen, setGroceryModalOpen] = useState(false);
  const [groceryEventId, setGroceryEventId] = useState("");
  const [groceryItemName, setGroceryItemName] = useState("");
  const [groceryQuantity, setGroceryQuantity] = useState("");
  const [groceryUnit, setGroceryUnit] = useState("kg");
  const [groceryUrgency, setGroceryUrgency] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [groceryNote, setGroceryNote] = useState("");
  const [grocerySubmitting, setGrocerySubmitting] = useState(false);
  const [grocerySuccess, setGrocerySuccess] = useState<string | null>(null);

  // Quick Portion Helper Modal state
  const [portionModalOpen, setPortionModalOpen] = useState(false);
  const [portionGuests, setPortionGuests] = useState<number>(100);

  // Load Kitchen Sticky Notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chef_kitchen_notes");
      if (saved) {
        setKitchenNotes(JSON.parse(saved));
      } else {
        const initialNotes: KitchenNote[] = [
          {
            id: "note-1",
            text: "Check main freezer & cold room temperature at start of shift (target: -18°C)",
            done: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "note-2",
            text: "Clean fryer oils and wipe spice counters before evening service",
            done: true,
            createdAt: new Date().toISOString(),
          },
        ];
        setKitchenNotes(initialNotes);
        localStorage.setItem("chef_kitchen_notes", JSON.stringify(initialNotes));
      }
    } catch (err) {
      console.error("Failed to load kitchen notes", err);
    }
  }, []);

  const saveNotes = (updated: KitchenNote[]) => {
    setKitchenNotes(updated);
    try {
      localStorage.setItem("chef_kitchen_notes", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save kitchen notes", err);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const note: KitchenNote = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    saveNotes([note, ...kitchenNotes]);
    setNewNoteText("");
  };

  const handleToggleNote = (id: string) => {
    const updated = kitchenNotes.map((n) => (n.id === id ? { ...n, done: !n.done } : n));
    saveNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
    const updated = kitchenNotes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  // Load dashboard data from backend
  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [eventsRes, tasksRes, requestsRes] = await Promise.all([
        getKitchenEvents({}, token),
        getKitchenTasks("", token),
        getKitchenPurchaseRequests("", token).catch(() => ({ data: [] })),
      ]);

      const loadedEvents = eventsRes.data || [];
      setEvents(loadedEvents);
      setTasks(tasksRes.data || []);
      setPurchaseRequests(requestsRes.data || []);

      if (loadedEvents.length > 0 && !selectedEventForTask) {
        setSelectedEventForTask(loadedEvents[0].eventId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load kitchen dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      void loadData();
    }
  }, [token]);

  // Open simple ingredient guide modal
  const handleOpenCalcModal = async (ev: KitchenEventItem) => {
    setCalcModalEvent(ev);
    setCalcLoading(true);
    try {
      const res = await calculateKitchenIngredients(ev.eventId, 5, token);
      setCalcResult(res.data);
    } catch (err) {
      console.error("Ingredient calc error:", err);
    } finally {
      setCalcLoading(false);
    }
  };

  // 1-Click Request All Shortages from ingredient calculator
  const handleRequestAllShortages = async () => {
    if (!calcResult || !calcModalEvent || calcResult.shortages.length === 0) return;
    try {
      setRequestingShortages(true);
      await createKitchenPurchaseRequest(
        {
          eventId: calcModalEvent.eventId,
          items: calcResult.shortages.map((s) => ({
            itemName: s.name,
            requiredQuantity: s.requiredQuantity,
            availableQuantity: s.availableQuantity || 0,
            shortageQuantity: s.shortageQuantity || s.requiredQuantity,
            unit: s.unit || "kg",
            urgency: "HIGH",
            stockItem: s.stockItemId || undefined,
            notes: `Missing ingredient for ${calcModalEvent.eventName}`,
          })),
          notes: `Grocery order for ${calcModalEvent.eventName} (${calcModalEvent.guests} guests)`,
        },
        token
      );
      alert("Grocery request for missing ingredients sent to store successfully!");
      const reqsRes = await getKitchenPurchaseRequests("", token).catch(() => ({ data: [] }));
      setPurchaseRequests(reqsRes.data || []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send shortage request");
    } finally {
      setRequestingShortages(false);
    }
  };

  // Submit Quick Grocery Order
  const handleQuickGrocerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groceryItemName.trim() || !groceryQuantity) return;
    const qty = Number(groceryQuantity) || 1;

    try {
      setGrocerySubmitting(true);
      await createKitchenPurchaseRequest(
        {
          eventId: groceryEventId || undefined,
          items: [
            {
              itemName: groceryItemName.trim(),
              requiredQuantity: qty,
              availableQuantity: 0,
              shortageQuantity: qty,
              unit: groceryUnit,
              urgency: groceryUrgency === "URGENT" ? "HIGH" : "MEDIUM",
              notes: groceryNote.trim() || undefined,
            },
          ],
          notes: groceryNote.trim() || "Quick grocery order from Chef Dashboard",
        },
        token
      );

      setGrocerySuccess("Grocery order sent to store manager!");
      setGroceryItemName("");
      setGroceryQuantity("");
      setGroceryNote("");

      const reqsRes = await getKitchenPurchaseRequests("", token).catch(() => ({ data: [] }));
      setPurchaseRequests(reqsRes.data || []);

      setTimeout(() => {
        setGrocerySuccess(null);
        setGroceryModalOpen(false);
      }, 1500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit grocery request");
    } finally {
      setGrocerySubmitting(false);
    }
  };

  // Handle adding a simple prep task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTaskTitle.trim()) return;

    const eventId = selectedEventForTask || (events.length > 0 ? events[0].eventId : "");
    if (!eventId) {
      alert("Please select an event to link this task to.");
      return;
    }

    try {
      setTaskCreating(true);
      await createKitchenTask(
        {
          eventId,
          title: newTaskTitle.trim(),
          dutyTitle: "Kitchen Prep",
        },
        token
      );
      setNewTaskTitle("");
      const updated = await getKitchenTasks("", token);
      setTasks(updated.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTaskCreating(false);
    }
  };

  // Toggle task status (Pending <-> Completed)
  const handleToggleTaskStatus = async (dutyId: string, taskId: string, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    try {
      await updateKitchenTaskStatus(dutyId, taskId, { status: nextStatus }, token);
      const updated = await getKitchenTasks("", token);
      setTasks(updated.data || []);
    } catch (err) {
      console.error("Task toggle error:", err);
    }
  };

  // Remove task from prep checklist
  const handleDeleteTask = async (dutyId: string, taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await deleteKitchenTask(dutyId, taskId, token);
    } catch (err) {
      console.warn("Task delete notice:", err);
    } finally {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // Dietary helper: checks case-insensitively for veg/vegan
  const isVegDietary = (dietary?: string) => {
    const d = (dietary || "").toLowerCase();
    return d === "veg" || d === "vegan";
  };

  // Date helper utilities
  const isDateToday = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const isDateTomorrow = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      d.getFullYear() === tomorrow.getFullYear() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getDate() === tomorrow.getDate()
    );
  };

  const isDateThisWeek = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    return d >= now && d <= nextWeek;
  };

  // Filter events by Search & Time
  const filteredEvents = events.filter((ev) => {
    // Search check
    if (eventSearch.trim()) {
      const q = eventSearch.toLowerCase();
      const match =
        ev.eventName.toLowerCase().includes(q) ||
        (ev.location && ev.location.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Time filter check
    if (timeFilter === "TODAY") {
      return isDateToday(ev.eventDate);
    }
    if (timeFilter === "TOMORROW") {
      return isDateTomorrow(ev.eventDate);
    }
    if (timeFilter === "THIS_WEEK") {
      return isDateThisWeek(ev.eventDate);
    }

    return true;
  });

  const totalDishesCount = events.reduce(
    (acc, ev) => acc + (ev.foodMenu?.items?.length || 0),
    0
  );
  const pendingTasksCount = tasks.filter((t) => t.status !== "COMPLETED").length;
  const pendingRequestsCount = purchaseRequests.filter((r) => r.status === "PENDING").length;

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center rounded-3xl border border-[#e8e1d8] bg-white">
        <div className="flex items-center gap-3 text-sm font-semibold text-stone-600">
          <Loader2 size={22} className="animate-spin text-[#9a6c37]" />
          <span>Opening Kitchen Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. FRIENDLY CHEF HEADER & SUMMARY CARDS */}
      {/* ========================================================================= */}
      <section className="rounded-3xl border border-[#e8e1d8] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-[#9a6c37] shadow-2xs shrink-0">
              <ChefHat size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                  Kitchen & Catering
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500 font-medium">Chef Console</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#29241f] mt-0.5">
                Chef Manager Dashboard
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Cooking orders, daily kitchen tasks, food menus, and grocery requests.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPortionModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-[#faf8f5] px-3 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Calculator size={14} className="text-[#9a6c37]" />
              <span>Portion Helper</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (events.length > 0 && !groceryEventId) {
                  setGroceryEventId(events[0].eventId);
                }
                setGroceryModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#9a6c37] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#7f582c] transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <ShoppingCart size={14} />
              <span>Order Groceries</span>
            </button>

            <button
              type="button"
              onClick={() => void loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Updating..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* 4 Simple Snapshot Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-4 border-t border-[#f0ece6]">
          <div className="rounded-2xl bg-[#faf8f5] p-3 text-center border border-stone-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Events to Cook
            </p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-[#29241f]">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl bg-[#faf8f5] p-3 text-center border border-stone-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Dishes on Menu
            </p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-[#9a6c37]">
              {totalDishesCount}
            </p>
          </div>

          <div className="rounded-2xl bg-[#faf8f5] p-3 text-center border border-stone-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Prep Tasks Left
            </p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-amber-800">
              {pendingTasksCount}
            </p>
          </div>

          <div className="rounded-2xl bg-[#faf8f5] p-3 text-center border border-stone-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Grocery Orders
            </p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-emerald-800">
              {pendingRequestsCount} pending
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. QUICK ACCESS SHORTCUTS */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/manager/food"
          className="group flex flex-col justify-between rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs transition hover:border-[#9a6c37] hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800 group-hover:bg-[#9a6c37] group-hover:text-white transition">
              <Utensils size={18} />
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-[#9a6c37] transition" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-black text-[#29241f] group-hover:text-[#9a6c37] transition">
              Food Menu & Dishes
            </p>
            <p className="text-[11px] text-gray-500">View recipes & pricing</p>
          </div>
        </Link>

        <Link
          href="/manager/stock"
          className="group flex flex-col justify-between rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs transition hover:border-[#9a6c37] hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-800 group-hover:bg-[#29241f] group-hover:text-white transition">
              <Package size={18} />
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-[#29241f] transition" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-black text-[#29241f] group-hover:text-[#9a6c37] transition">
              Kitchen Stock
            </p>
            <p className="text-[11px] text-gray-500">Vessels, gas & utensils</p>
          </div>
        </Link>

        <Link
          href="/manager/staff"
          className="group flex flex-col justify-between rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs transition hover:border-[#9a6c37] hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800 group-hover:bg-blue-600 group-hover:text-white transition">
              <Users size={18} />
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-600 transition" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-black text-[#29241f] group-hover:text-[#9a6c37] transition">
              Kitchen Staff
            </p>
            <p className="text-[11px] text-gray-500">Cooks, helpers & duties</p>
          </div>
        </Link>

        <Link
          href="/manager/events"
          className="group flex flex-col justify-between rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs transition hover:border-[#9a6c37] hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white transition">
              <Calendar size={18} />
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-emerald-700 transition" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-black text-[#29241f] group-hover:text-[#9a6c37] transition">
              All Events
            </p>
            <p className="text-[11px] text-gray-500">Calendar & schedule</p>
          </div>
        </Link>
      </section>

      {/* ========================================================================= */}
      {/* 3. CHEF'S DAILY WHITEBOARD / STICKY NOTES */}
      {/* ========================================================================= */}
      <section className="rounded-3xl border border-[#e8e1d8] bg-gradient-to-br from-[#faf8f5] to-amber-50/30 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
              <StickyNote size={17} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#29241f]">
                Chef&apos;s Daily Kitchen Notes
              </h2>
              <p className="text-[11px] text-gray-500">
                Quick reminders for your kitchen crew, morning prep, and special requests.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-stone-500">
            {kitchenNotes.filter((n) => !n.done).length} active notes
          </span>
        </div>

        {/* Add Note Input */}
        <form onSubmit={handleAddNote} className="flex items-center gap-2 mb-3">
          <input
            type="text"
            placeholder="Write a quick note for the kitchen (e.g. VIP guest has peanut allergy)..."
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            className="h-9 flex-1 rounded-xl border border-stone-300 bg-white px-3 text-xs outline-none focus:border-[#9a6c37] focus:ring-1 focus:ring-[#9a6c37]"
          />
          <button
            type="submit"
            disabled={!newNoteText.trim()}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-[#29241f] px-3.5 text-xs font-bold text-white hover:bg-black transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Note</span>
          </button>
        </form>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {kitchenNotes.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2 col-span-full text-center">
              No notes on the kitchen board. Type a note above to leave a reminder for today!
            </p>
          ) : (
            kitchenNotes.map((note) => (
              <div
                key={note.id}
                className={`flex items-start justify-between gap-2 rounded-xl p-2.5 border transition ${
                  note.done
                    ? "bg-stone-50/80 border-stone-200 opacity-60"
                    : "bg-white border-amber-200 shadow-2xs"
                }`}
              >
                <div
                  onClick={() => handleToggleNote(note.id)}
                  className="flex items-start gap-2 flex-1 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                      note.done
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {note.done && <Check size={11} />}
                  </button>
                  <p
                    className={`text-xs ${
                      note.done ? "line-through text-stone-400" : "font-semibold text-stone-800"
                    }`}
                  >
                    {note.text}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-stone-300 hover:text-rose-500 p-0.5 transition cursor-pointer"
                  title="Delete note"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MAIN WORKSPACE: COOKING SCHEDULE (Left) + PREP & GROCERIES (Right) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Catering Events & Cooking Schedule (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-[#29241f]">
                Cooking Orders & Food Menus
              </h2>
              <p className="text-xs text-gray-500">
                Menus, guest plates, and prep slips for upcoming bookings.
              </p>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTimeFilter("ALL")}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  timeFilter === "ALL"
                    ? "bg-white text-[#29241f] shadow-2xs"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                All ({events.length})
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("TODAY")}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  timeFilter === "TODAY"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Today ({events.filter((e) => isDateToday(e.eventDate)).length})
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("TOMORROW")}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  timeFilter === "TOMORROW"
                    ? "bg-[#29241f] text-white shadow-2xs"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Tomorrow ({events.filter((e) => isDateTomorrow(e.eventDate)).length})
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("THIS_WEEK")}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  timeFilter === "THIS_WEEK"
                    ? "bg-white text-[#29241f] shadow-2xs"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                This Week
              </button>
            </div>
          </div>

          {/* Quick Search */}
          {events.length > 2 && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by name or location..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-[#9a6c37]"
              />
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400">
              <Utensils size={32} className="mx-auto text-gray-300" />
              <p className="mt-2 text-sm font-bold text-gray-700">No events found for this filter</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Switch filters or when new catering events are booked, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredEvents.map((ev) => {
                const menuItems = ev.foodMenu?.items || [];
                const guests = ev.guests || 0;
                const vegCount = menuItems.filter((m) => isVegDietary(m.dietary)).length;
                const nonVegCount = menuItems.length - vegCount;

                const isToday = isDateToday(ev.eventDate);
                const isTomorrow = isDateTomorrow(ev.eventDate);

                return (
                  <div
                    key={ev.eventId}
                    className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition hover:border-[#9a6c37]/50 space-y-3.5 ${
                      isToday
                        ? "border-amber-300 ring-2 ring-amber-100"
                        : "border-[#e8e1d8]"
                    }`}
                  >
                    {/* Top Row: Event Name, Status & Highlights */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 pb-3 border-b border-gray-100">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-black text-[#29241f]">
                            {ev.eventName}
                          </h3>

                          {isToday && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase text-rose-700 border border-rose-200 animate-pulse">
                              <Flame size={11} />
                              Cooking Today
                            </span>
                          )}

                          {isTomorrow && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800 border border-amber-200">
                              <Clock size={11} />
                              Tomorrow
                            </span>
                          )}

                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            {ev.status || "Confirmed"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1 text-[#9a6c37] font-semibold">
                            <Calendar size={13} />
                            {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : "Date TBD"}
                          </span>
                          {ev.eventTime && (
                            <span className="flex items-center gap-1">
                              <Clock size={13} />
                              {ev.eventTime}
                            </span>
                          )}
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} />
                              {ev.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Guest Count Pill */}
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-black text-amber-900 shrink-0">
                        <Users size={14} className="text-[#9a6c37]" />
                        <span>{guests} Guests</span>
                      </div>
                    </div>

                    {/* Middle: Dietary Summary & Food Menu */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                          Menu Dishes ({menuItems.length})
                        </p>

                        {/* Veg / Non-Veg Breakdown Badge */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-800 px-1.5 py-0.5 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {vegCount} Veg
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-800 px-1.5 py-0.5 border border-rose-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            {nonVegCount} Non-Veg
                          </span>
                        </div>
                      </div>

                      {menuItems.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No food items added to this menu yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {menuItems.map((dish, idx) => (
                            <span
                              key={`${dish.name}-${idx}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#faf8f5] border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-800"
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isVegDietary(dish.dietary) ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              <span>{dish.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons: Print Slip, Check Ingredients, View Event */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setKitchenSlipEvent(ev)}
                          className="inline-flex items-center gap-1 rounded-lg bg-stone-100 hover:bg-[#29241f] hover:text-white px-2.5 py-1 text-xs font-bold text-stone-800 transition cursor-pointer"
                        >
                          <FileText size={13} />
                          <span>Kitchen Prep Slip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleOpenCalcModal(ev)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#9a6c37] hover:text-[#7f582c] transition cursor-pointer"
                        >
                          <FileSpreadsheet size={13} />
                          <span>Check Raw Ingredients</span>
                        </button>
                      </div>

                      <Link
                        href={`/manager/events/${ev.eventId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black transition"
                      >
                        <span>Event Details</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Kitchen Prep Checklist & Grocery Requests (Span 1) */}
        <div className="space-y-6">
          {/* A. TODAY'S KITCHEN PREP CHECKLIST */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-black text-[#29241f]">
                Kitchen Prep Checklist
              </h2>
              <p className="text-xs text-gray-500">
                Tick off prep duties as your cooks finish them.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
              {/* Quick Add Task Input */}
              <form onSubmit={handleCreateTask} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Marinate chicken, chop salad..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="h-9 flex-1 rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37]"
                  />
                  <button
                    type="submit"
                    disabled={taskCreating || !newTaskTitle.trim()}
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-[#29241f] px-3 text-xs font-bold text-white hover:bg-black transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Event selector if multiple events */}
                {events.length > 1 && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <span>For event:</span>
                    <select
                      value={selectedEventForTask}
                      onChange={(e) => setSelectedEventForTask(e.target.value)}
                      className="rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 outline-none"
                    >
                      {events.map((ev) => (
                        <option key={ev.eventId} value={ev.eventId}>
                          {ev.eventName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </form>

              {/* Tasks List */}
              <div className="space-y-2 pt-2 border-t border-gray-100 max-h-72 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center italic">
                    No kitchen prep tasks added yet. Add a quick task above!
                  </p>
                ) : (
                  tasks.map((t) => {
                    const isDone = t.status === "COMPLETED";
                    return (
                      <div
                        key={t.id}
                        onClick={() => void handleToggleTaskStatus(t.dutyId, t.id, t.status)}
                        className={`flex items-start gap-2.5 rounded-xl p-2.5 transition cursor-pointer border ${
                          isDone
                            ? "bg-gray-50 border-gray-200 opacity-60"
                            : "bg-[#faf8f5] border-stone-200 hover:border-[#9a6c37]"
                        }`}
                      >
                        <button
                          type="button"
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                            isDone
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isDone && <CheckCircle2 size={12} />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-bold ${
                              isDone ? "line-through text-gray-500" : "text-[#29241f]"
                            }`}
                          >
                            {t.title}
                          </p>
                          {t.eventName && (
                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                              {t.eventName}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => void handleDeleteTask(t.dutyId, t.id, e)}
                          title="Remove task"
                          className="mt-0.5 text-gray-300 hover:text-rose-500 p-0.5 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* B. GROCERY ORDERS & REQUISITIONS STATUS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#29241f]">
                  Recent Grocery Orders
                </h2>
                <p className="text-[11px] text-gray-500">
                  Requests sent to store / purchasing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGroceryModalOpen(true)}
                className="text-xs font-bold text-[#9a6c37] hover:underline cursor-pointer"
              >
                + New Order
              </button>
            </div>

            <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs space-y-2.5 max-h-60 overflow-y-auto">
              {purchaseRequests.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center italic">
                  No grocery orders placed recently.
                </p>
              ) : (
                purchaseRequests.slice(0, 5).map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#faf8f5] border border-stone-100 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#29241f] truncate">
                        {req.items.map((i) => `${i.itemName} (${i.shortageQuantity} ${i.unit})`).join(", ")}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        req.status === "FULFILLED"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "APPROVED"
                          ? "bg-sky-100 text-sky-800"
                          : req.status === "PARTIALLY_FULFILLED"
                          ? "bg-indigo-100 text-indigo-800"
                          : req.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800"
                          : req.status === "CANCELLED"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {req.status === "PARTIALLY_FULFILLED"
                        ? "PARTIAL"
                        : req.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL: KITCHEN PREP SLIP (PRINTABLE KOT) */}
      {/* ========================================================================= */}
      {kitchenSlipEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Modal Controls (Hidden in print) */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Printer size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#29241f]">
                    Kitchen Cooking Slip / KOT
                  </h3>
                  <p className="text-xs text-gray-500">
                    Print or display on tablet for kitchen line cooks.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setKitchenSlipEvent(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PRINTABLE SLIP CONTENT */}
            <div id="kitchen-prep-slip" className="space-y-4 p-2 bg-white">
              {/* Slip Header */}
              <div className="border-b-2 border-dashed border-gray-300 pb-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    Kitchen Order Ticket
                  </span>
                  <h2 className="text-xl font-black text-gray-900 mt-1">
                    {kitchenSlipEvent.eventName}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {kitchenSlipEvent.eventType} · Status: {kitchenSlipEvent.status || "Confirmed"}
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-stone-900 text-white rounded-xl px-3 py-1.5 text-sm font-black">
                    {kitchenSlipEvent.guests || 0} GUESTS
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Printed: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Event Timing & Venue */}
              <div className="grid grid-cols-3 gap-2 bg-[#faf8f5] p-3 rounded-xl border border-stone-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Event Date</span>
                  <p className="font-bold text-gray-900">
                    {kitchenSlipEvent.eventDate
                      ? new Date(kitchenSlipEvent.eventDate).toLocaleDateString()
                      : "TBD"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Meal Service Time</span>
                  <p className="font-bold text-gray-900">{kitchenSlipEvent.eventTime || "Scheduled"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Location / Hall</span>
                  <p className="font-bold text-gray-900">{kitchenSlipEvent.location || "Main Dining"}</p>
                </div>
              </div>

              {/* Dietary Split */}
              <div className="flex items-center gap-3 py-2 border-y border-gray-100 text-xs font-bold">
                <span className="text-gray-500">Dietary Summary:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  🥬 Veg: {kitchenSlipEvent.foodMenu?.items?.filter((i) => isVegDietary(i.dietary)).length || 0} Dishes
                </span>
                <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  🍗 Non-Veg: {kitchenSlipEvent.foodMenu?.items?.filter((i) => !isVegDietary(i.dietary)).length || 0} Dishes
                </span>
                {kitchenSlipEvent.foodMenu?.servingType && (
                  <span className="text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                    Style: {kitchenSlipEvent.foodMenu.servingType}
                  </span>
                )}
              </div>

              {/* Full Dish List */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                  Confirmed Dishes for Cooking
                </h4>
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                  {(kitchenSlipEvent.foodMenu?.items || []).map((dish, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-white text-xs hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-400 text-[11px] w-4">{i + 1}.</span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isVegDietary(dish.dietary) ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        <span className="font-bold text-gray-900">{dish.name}</span>
                        {dish.category && (
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {dish.category}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 font-medium text-[11px]">
                        {isVegDietary(dish.dietary) ? "Vegetarian" : "Non-Vegetarian"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Notes & Sign-off */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-dashed border-gray-300 text-xs">
                <div>
                  <p className="font-bold text-gray-700">Special Cooking Notes:</p>
                  <p className="text-gray-500 text-[11px] mt-0.5 italic">
                    {kitchenSlipEvent.foodMenu?.notes || "No special dietary allergies noted. Standard seasoning."}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400">Head Chef Sign-Off</p>
                  <div className="mt-4 border-b border-gray-400 w-36 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: QUICK GROCERY / INGREDIENT ORDER */}
      {/* ========================================================================= */}
      {groceryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <ShoppingCart size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#29241f]">
                    Order Extra Groceries
                  </h3>
                  <p className="text-xs text-gray-500">
                    Send quick shortage request to store or manager.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGroceryModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {grocerySuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check size={24} />
                </div>
                <p className="text-sm font-bold text-gray-800">{grocerySuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleQuickGrocerySubmit} className="space-y-3.5 text-xs">
                {/* Linked Event */}
                {events.length > 0 && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      For Event (Optional)
                    </label>
                    <select
                      value={groceryEventId}
                      onChange={(e) => setGroceryEventId(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#9a6c37]"
                    >
                      <option value="">General Kitchen Stock (No specific event)</option>
                      {events.map((ev) => (
                        <option key={ev.eventId} value={ev.eventId}>
                          {ev.eventName} ({ev.guests} guests)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Item Name */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Ingredient / Grocery Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basmati Rice, Cooking Oil, Paneer..."
                    value={groceryItemName}
                    onChange={(e) => setGroceryItemName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-[#9a6c37]"
                  />
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Quantity Needed *
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      required
                      placeholder="e.g. 15"
                      value={groceryQuantity}
                      onChange={(e) => setGroceryQuantity(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Unit</label>
                    <select
                      value={groceryUnit}
                      onChange={(e) => setGroceryUnit(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-[#9a6c37]"
                    >
                      <option value="kg">kg (Kilograms)</option>
                      <option value="grams">grams</option>
                      <option value="liters">liters</option>
                      <option value="packets">packets</option>
                      <option value="pieces">pieces / pcs</option>
                      <option value="tins">tins / cans</option>
                      <option value="bunches">bunches</option>
                    </select>
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    When is this needed?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGroceryUrgency("NORMAL")}
                      className={`rounded-xl border p-2 text-center font-bold transition cursor-pointer ${
                        groceryUrgency === "NORMAL"
                          ? "border-[#9a6c37] bg-amber-50/50 text-[#9a6c37]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Normal (Upcoming)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroceryUrgency("URGENT")}
                      className={`rounded-xl border p-2 text-center font-bold transition cursor-pointer ${
                        groceryUrgency === "URGENT"
                          ? "border-rose-400 bg-rose-50 text-rose-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Urgent (Need Today!)
                    </button>
                  </div>
                </div>

                {/* Extra Notes */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Note for Purchasing (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. For dinner banquet biryani prep"
                    value={groceryNote}
                    onChange={(e) => setGroceryNote(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-[#9a6c37]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setGroceryModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grocerySubmitting || !groceryItemName.trim() || !groceryQuantity}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241f] px-4 py-2 text-xs font-bold text-white hover:bg-black transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {grocerySubmitting && <Loader2 size={13} className="animate-spin" />}
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: PORTION HELPER (QUICK CATERING RULES-OF-THUMB) */}
      {/* ========================================================================= */}
      {portionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <Calculator size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#29241f]">
                    Kitchen Portion Helper
                  </h3>
                  <p className="text-xs text-gray-500">
                    Quick bulk catering rule-of-thumb quantities per guest.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPortionModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Guest Slider / Input */}
            <div className="rounded-2xl bg-[#faf8f5] p-3.5 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-700">
                  Calculate for Guest Count:
                </label>
                <span className="text-base font-black text-[#9a6c37]">
                  {portionGuests} Guests
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={portionGuests}
                onChange={(e) => setPortionGuests(Number(e.target.value))}
                className="w-full accent-[#9a6c37] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                <span>10 guests</span>
                <span>250 guests</span>
                <span>500 guests</span>
                <span>1000 guests</span>
              </div>
            </div>

            {/* Estimates Table */}
            <div className="space-y-2 text-xs">
              <p className="text-stone-500 font-semibold text-[11px]">
                Estimated bulk kitchen raw supplies for {portionGuests} guests:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-gray-200 p-2.5 bg-white">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Rice / Biryani</span>
                  <p className="text-sm font-black text-gray-900 mt-0.5">
                    {(portionGuests * 0.15).toFixed(1)} kg <span className="text-xs font-normal text-gray-500">(raw)</span>
                  </p>
                  <p className="text-[10px] text-gray-400">~150g per head</p>
                </div>

                <div className="rounded-xl border border-gray-200 p-2.5 bg-white">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Gravy / Dal / Curry</span>
                  <p className="text-sm font-black text-gray-900 mt-0.5">
                    {(portionGuests * 0.2).toFixed(1)} Liters
                  </p>
                  <p className="text-[10px] text-gray-400">~200ml per head</p>
                </div>

                <div className="rounded-xl border border-gray-200 p-2.5 bg-white">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Meat / Chicken</span>
                  <p className="text-sm font-black text-gray-900 mt-0.5">
                    {(portionGuests * 0.15).toFixed(1)} kg <span className="text-xs font-normal text-gray-500">(cut)</span>
                  </p>
                  <p className="text-[10px] text-gray-400">~150g per non-veg guest</p>
                </div>

                <div className="rounded-xl border border-gray-200 p-2.5 bg-white">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Paneer / Veg Mains</span>
                  <p className="text-sm font-black text-gray-900 mt-0.5">
                    {(portionGuests * 0.12).toFixed(1)} kg
                  </p>
                  <p className="text-[10px] text-gray-400">~120g per veg guest</p>
                </div>

                <div className="rounded-xl border border-gray-200 p-2.5 bg-white">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Starters / Snacks</span>
                  <p className="text-sm font-black text-gray-900 mt-0.5">
                    {portionGuests * 3} Pieces
                  </p>
                  <p className="text-[10px] text-gray-400">~3 pieces per head</p>
                </div>

                <div className="rounded-xl border border-gray-200 p-2.5 bg-white">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Sweets / Dessert</span>
                  <p className="text-sm font-black text-gray-900 mt-0.5">
                    {Math.round(portionGuests * 1.5)} Servings
                  </p>
                  <p className="text-[10px] text-gray-400">~1.5 pcs / 80g per head</p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setPortionModalOpen(false)}
                className="rounded-xl bg-[#29241f] px-4 py-2 text-xs font-bold text-white hover:bg-black cursor-pointer"
              >
                Close Helper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: RAW INGREDIENT ESTIMATOR & SHORTAGE REQUISITION */}
      {/* ========================================================================= */}
      {calcModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#29241f]">
                  Raw Ingredient Check
                </h3>
                <p className="text-xs text-gray-500">
                  {calcModalEvent.eventName} · {calcModalEvent.guests || 0} Guests
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCalcModalEvent(null);
                  setCalcResult(null);
                }}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {calcLoading ? (
              <div className="flex h-36 items-center justify-center">
                <Loader2 size={24} className="animate-spin text-[#9a6c37]" />
              </div>
            ) : !calcResult || calcResult.aggregatedIngredients.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p className="text-xs font-medium">
                  No standard recipes attached to the dishes in this menu yet.
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  You can set recipes and ingredients in the Food Menu section.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Estimated groceries for {calcResult.guests} servings:</span>
                  {calcResult.shortages.length > 0 && (
                    <span className="font-bold text-rose-600">
                      {calcResult.shortages.length} Shortage item(s) detected
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf8f5] text-[11px] font-bold text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2">Ingredient</th>
                        <th className="px-3 py-2 text-right">Required</th>
                        <th className="px-3 py-2 text-right">In Stock</th>
                        <th className="px-3 py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {calcResult.aggregatedIngredients.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/60">
                          <td className="px-3 py-2 font-bold text-gray-900">{item.name}</td>
                          <td className="px-3 py-2 text-right font-black text-[#9a6c37]">
                            {item.requiredQuantity} {item.unit}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-500">
                            {item.availableQuantity !== null
                              ? `${item.availableQuantity} ${item.unit}`
                              : "-"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {item.hasShortage ? (
                              <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
                                Short {item.shortageQuantity} {item.unit}
                              </span>
                            ) : (
                              <span className="font-bold text-emerald-600 text-[10px]">
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 1-Click Request All Shortages Button if any shortage */}
                {calcResult.shortages.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => void handleRequestAllShortages()}
                      disabled={requestingShortages}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {requestingShortages ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={14} />
                      )}
                      <span>Request All {calcResult.shortages.length} Missing Ingredients from Store</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 text-right border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setCalcModalEvent(null);
                  setCalcResult(null);
                }}
                className="rounded-xl bg-[#29241f] px-4 py-2 text-xs font-bold text-white hover:bg-black cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

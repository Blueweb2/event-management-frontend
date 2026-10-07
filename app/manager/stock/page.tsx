"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  PackageCheck,
  PackagePlus,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  RotateCcw,
  ShieldAlert,
  Loader2,
  Calendar,
  User,
  MapPin,
  FileText,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  getStockItems,
  createStockItem,
  updateStockItem,
  addStock,
  adjustInventory,
  deleteStockItem,
  getManagerStockSummary,
  getStockTransactions,
  verifyStockReturn,
  reportDiscrepancy,
} from "@/lib/stock.api";
import type {
  StockItem,
  StockCategory,
  EventStockAllocation,
  StockTransaction,
  ManagerStockSummary,
} from "@/types/stock";
import Button from "@/components/ui/Button";

const CATEGORIES: StockCategory[] = [
  "Crockery",
  "Glassware",
  "Cutlery",
  "Furniture",
  "Audio/Visual",
  "Linen",
  "Kitchen Equipment",
  "Decor",
  "Lighting",
  "Other",
];

export default function ManagerStockPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"inventory" | "allocations" | "returns" | "history">("inventory");

  // State
  const [items, setItems] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<ManagerStockSummary | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<StockItem | null>(null);
  const [restockQty, setRestockQty] = useState(10);
  const [restockNotes, setRestockNotes] = useState("");

  const [adjustItem, setAdjustItem] = useState<StockItem | null>(null);
  const [adjustData, setAdjustData] = useState({ newTotal: 0, newAvailable: 0, reason: "" });

  const [verifyAllocation, setVerifyAllocation] = useState<EventStockAllocation | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");

  const [discrepancyAllocation, setDiscrepancyAllocation] = useState<EventStockAllocation | null>(null);
  const [discrepancyNotes, setDiscrepancyNotes] = useState("");

  const [newItem, setNewItem] = useState({
    name: "",
    category: "Crockery" as StockCategory,
    totalQuantity: 50,
    minStockLevel: 10,
    unit: "pcs",
    unitPrice: 0,
    location: "Central Warehouse",
    description: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");

      const [itemsRes, summaryRes, txRes] = await Promise.all([
        getStockItems(token, {
          search,
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
          lowStock: lowStockFilter ? true : undefined,
        }),
        getManagerStockSummary(token),
        getStockTransactions(token, { limit: 50 }),
      ]);

      setItems(itemsRes.data || []);
      setSummary(summaryRes.data || null);
      setTransactions(txRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }, [token, search, categoryFilter, lowStockFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handlers
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await createStockItem(newItem, token);
      showToast(`Stock item "${newItem.name}" created successfully`);
      setCreateModalOpen(false);
      setNewItem({
        name: "",
        category: "Crockery",
        totalQuantity: 50,
        minStockLevel: 10,
        unit: "pcs",
        unitPrice: 0,
        location: "Central Warehouse",
        description: "",
      });
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !restockItem) return;
    try {
      await addStock(restockItem._id, { quantity: restockQty, notes: restockNotes }, token);
      showToast(`Restocked ${restockQty} ${restockItem.unit} to ${restockItem.name}`);
      setRestockItem(null);
      setRestockNotes("");
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restock");
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !adjustItem) return;
    try {
      await adjustInventory(adjustItem._id, adjustData, token);
      showToast(`Inventory adjusted for ${adjustItem.name}`);
      setAdjustItem(null);
      setAdjustData({ newTotal: 0, newAvailable: 0, reason: "" });
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to adjust inventory");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete "${name}" from master stock catalog?`)) return;
    try {
      await deleteStockItem(id, token);
      showToast(`Deleted "${name}"`);
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const handleVerifyReturn = async () => {
    if (!token || !verifyAllocation) return;
    try {
      await verifyStockReturn(
        verifyAllocation._id,
        {
          approvedReturnedQuantity: verifyAllocation.returnedQuantity,
          approvedDamagedQuantity: verifyAllocation.damagedQuantity,
          approvedLostQuantity: verifyAllocation.lostQuantity,
          managerNotes: verifyNotes,
          verificationNotes: verifyNotes,
        },
        token
      );
      showToast("Stock return verified & inventory restocked");
      setVerifyAllocation(null);
      setVerifyNotes("");
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  };

  const handleReportDiscrepancy = async () => {
    if (!token || !discrepancyAllocation) return;
    try {
      await reportDiscrepancy(discrepancyAllocation._id, { discrepancyNotes }, token);
      showToast("Discrepancy recorded");
      setDiscrepancyAllocation(null);
      setDiscrepancyNotes("");
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record discrepancy");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9a6c37]">Operations & Logistics</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#29241f] sm:text-3xl">
            Stock & Equipment Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Control master inventory, assign equipment to events, track staff handover, and verify returns.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#29241f] px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-black active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Stock Item</span>
        </button>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-500 hover:text-red-800">
            <X size={15} />
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9a6c37]/10 text-[#9a6c37]">
            <Package size={18} />
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Catalog</p>
          <p className="mt-0.5 text-2xl font-black text-[#29241f]">{summary?.totalItems ?? items.length}</p>
        </div>

        <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Clock size={18} />
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Active Allocations</p>
          <p className="mt-0.5 text-2xl font-black text-blue-900">{summary?.activeAllocationsCount ?? 0}</p>
        </div>

        <div
          onClick={() => setActiveTab("returns")}
          className="cursor-pointer rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs transition hover:bg-amber-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <RotateCcw size={18} />
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-amber-900">Returns Pending</p>
          <div className="flex items-center gap-2">
            <p className="mt-0.5 text-2xl font-black text-amber-900">{summary?.pendingReturnsCount ?? 0}</p>
            {(summary?.pendingReturnsCount ?? 0) > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white animate-pulse">
                Verify
              </span>
            )}
          </div>
        </div>

        <div
          onClick={() => {
            setLowStockFilter(true);
            setActiveTab("inventory");
          }}
          className="cursor-pointer rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs transition hover:bg-rose-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <AlertTriangle size={18} />
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-rose-900">Low Stock Alerts</p>
          <p className="mt-0.5 text-2xl font-black text-rose-900">{summary?.lowStockCount ?? 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "inventory"
              ? "border-[#9a6c37] text-[#9a6c37]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Package size={16} />
          <span>Master Inventory ({items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("allocations")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "allocations"
              ? "border-[#9a6c37] text-[#9a6c37]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <PackageCheck size={16} />
          <span>Event Allocations ({summary?.activeAllocationsCount ?? 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("returns")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "returns"
              ? "border-[#9a6c37] text-[#9a6c37]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <RotateCcw size={16} />
          <span>Returns & Verifications</span>
          {(summary?.pendingReturnsCount ?? 0) > 0 && (
            <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-black text-white">
              {summary?.pendingReturnsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "history"
              ? "border-[#9a6c37] text-[#9a6c37]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <History size={16} />
          <span>Audit History</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MASTER INVENTORY */}
      {/* ========================================================================= */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e8e1d8] bg-white p-3.5 shadow-xs">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stock by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 bg-[#fdfcfb] pl-9 pr-4 text-xs font-medium outline-none focus:border-[#9a6c37]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:border-[#9a6c37]"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setLowStockFilter(!lowStockFilter)}
                className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition cursor-pointer ${
                  lowStockFilter
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <AlertTriangle size={14} />
                <span>Low Stock Only</span>
              </button>
            </div>
          </div>

          {/* Table of Items */}
          {loading ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <Loader2 size={24} className="animate-spin text-[#9a6c37]" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
              <Package size={32} className="mx-auto text-gray-300" />
              <p className="mt-2 text-sm font-bold text-gray-900">No stock items found</p>
              <p className="text-xs text-gray-500">Create a new item or adjust search filters.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-[#f9f7f2] border-b border-[#e8e1d8] text-[10px] font-black uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Item / Category</th>
                      <th className="px-4 py-3 text-center">Available</th>
                      <th className="px-4 py-3 text-center">Reserved</th>
                      <th className="px-4 py-3 text-center">In Use</th>
                      <th className="px-4 py-3 text-center">Damaged / Lost</th>
                      <th className="px-4 py-3 text-center">Total</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item) => {
                      const isLow = item.availableQuantity <= (item.minStockLevel || 10);
                      return (
                        <tr key={item._id} className="hover:bg-[#fdfcfb] transition">
                          <td className="px-4 py-3.5 min-w-[180px]">
                            <p className="font-extrabold text-[#29241f] text-sm">{item.name}</p>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                              <span className="rounded-md bg-stone-100 px-1.5 py-0.2 font-semibold text-stone-700">
                                {item.category}
                              </span>
                              <span>·</span>
                              <span>{item.location || "Warehouse"}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-black ${
                                isLow
                                  ? "bg-rose-100 text-rose-800 border border-rose-200 animate-pulse"
                                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {item.availableQuantity} {item.unit}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center font-bold text-amber-700">
                            {item.reservedQuantity} {item.unit}
                          </td>

                          <td className="px-4 py-3.5 text-center font-bold text-blue-700">
                            {item.inUseQuantity} {item.unit}
                          </td>

                          <td className="px-4 py-3.5 text-center text-[11px]">
                            <span className="text-amber-700 font-bold">{item.damagedQuantity || 0} dmg</span>
                            <span className="text-gray-300 mx-1">/</span>
                            <span className="text-rose-700 font-bold">{item.lostQuantity || 0} lost</span>
                          </td>

                          <td className="px-4 py-3.5 text-center font-black text-gray-900">
                            {item.totalQuantity} {item.unit}
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setRestockItem(item);
                                  setRestockQty(10);
                                }}
                                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                              >
                                + Restock
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAdjustItem(item);
                                  setAdjustData({
                                    newTotal: item.totalQuantity,
                                    newAvailable: item.availableQuantity,
                                    reason: "",
                                  });
                                }}
                                className="rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                              >
                                Adjust
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item._id, item.name)}
                                className="rounded-lg p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete Item"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EVENT ALLOCATIONS */}
      {/* ========================================================================= */}
      {activeTab === "allocations" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-xs">
            <h2 className="text-base font-extrabold text-[#29241f]">Active Event Stock Allocations</h2>
            <p className="text-xs text-gray-500">Live equipment reserved and handed over to staff for upcoming and ongoing events.</p>

            <div className="mt-4 space-y-3">
              {(summary?.activeAllocations || []).length === 0 ? (
                <p className="rounded-xl bg-[#fdfcfb] p-6 text-center text-xs text-gray-500">
                  No active stock allocations right now.
                </p>
              ) : (
                summary?.activeAllocations.map((alloc) => {
                  const ev = typeof alloc.event === "object" ? alloc.event : null;
                  return (
                    <div
                      key={alloc._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-gray-100 bg-[#fdfcfb] hover:border-[#9a6c37]/30 transition"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#29241f]">{alloc.stockItem?.name || "Equipment"}</span>
                          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                            Qty: {alloc.takenQuantity || alloc.requiredQuantity} {alloc.stockItem?.unit}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            alloc.status === "TAKEN_BY_STAFF" ? "bg-emerald-100 text-emerald-800" :
                            alloc.status === "READY_FOR_COLLECTION" ? "bg-amber-100 text-amber-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {alloc.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-[#9a6c37]">
                            <Calendar size={13} />
                            {ev?.eventName || "Event"} ({ev?.eventDate ? new Date(ev.eventDate).toLocaleDateString() : ""})
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={13} />
                            Staff: {alloc.assignedStaff?.name || "Unassigned"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RETURNS & VERIFICATIONS */}
      {/* ========================================================================= */}
      {activeTab === "returns" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <RotateCcw size={18} />
              <h2 className="text-base font-extrabold">Staff Returns Awaiting Manager Verification</h2>
            </div>
            <p className="mt-1 text-xs text-amber-800">
              Review returned physical stock, damaged items, and loss reports submitted by staff before restock confirmation.
            </p>

            <div className="mt-4 space-y-3">
              {(summary?.pendingReturns || []).length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                  <p className="mt-2 text-sm font-bold text-gray-900">All Returns Verified</p>
                  <p className="text-xs text-gray-500">No stock returns pending verification at this time.</p>
                </div>
              ) : (
                summary?.pendingReturns.map((alloc) => {
                  const ev = typeof alloc.event === "object" ? alloc.event : null;
                  return (
                    <div
                      key={alloc._id}
                      className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-gray-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-[#29241f]">{alloc.stockItem?.name}</h3>
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-800 uppercase">
                              {alloc.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#9a6c37] font-semibold mt-0.5">
                            Event: {ev?.eventName} · Staff: {alloc.assignedStaff?.name} ({alloc.assignedStaff?.phone || "No phone"})
                          </p>
                        </div>

                        <div className="text-xs text-right text-gray-400">
                          Submitted: {alloc.returnedAt ? new Date(alloc.returnedAt).toLocaleString() : "Recently"}
                        </div>
                      </div>

                      {/* Quantities Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#faf8f5] p-3 rounded-xl text-xs">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">Taken</p>
                          <p className="text-sm font-black text-gray-900">{alloc.takenQuantity} {alloc.stockItem?.unit}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-emerald-700">Returned Good</p>
                          <p className="text-sm font-black text-emerald-700">{alloc.returnedQuantity} {alloc.stockItem?.unit}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-amber-700">Damaged</p>
                          <p className="text-sm font-black text-amber-700">{alloc.damagedQuantity || 0} {alloc.stockItem?.unit}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-rose-700">Lost / Missing</p>
                          <p className="text-sm font-black text-rose-700">{alloc.lostQuantity || 0} {alloc.stockItem?.unit}</p>
                        </div>
                      </div>

                      {/* Reasons & Notes */}
                      {(alloc.damagedReason || alloc.lostReason || alloc.returnNotes) && (
                        <div className="space-y-1 text-xs text-gray-600 bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                          {alloc.damagedReason && (
                            <p>
                              <strong className="text-amber-800">Damage Explanation:</strong> {alloc.damagedReason}
                            </p>
                          )}
                          {alloc.lostReason && (
                            <p>
                              <strong className="text-rose-800">Loss Explanation:</strong> {alloc.lostReason}
                            </p>
                          )}
                          {alloc.returnNotes && (
                            <p>
                              <strong className="text-gray-700">Staff Return Note:</strong> {alloc.returnNotes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDiscrepancyAllocation(alloc);
                            setDiscrepancyNotes("");
                          }}
                          className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                        >
                          Report Discrepancy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVerifyAllocation(alloc);
                            setVerifyNotes("");
                          }}
                          className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-emerald-800 transition active:scale-95 cursor-pointer"
                        >
                          Verify & Restock ({alloc.returnedQuantity} {alloc.stockItem?.unit})
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDIT TRANSACTION HISTORY */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-xs">
            <h2 className="text-base font-extrabold text-[#29241f]">Immutable Stock Audit Trail</h2>
            <p className="text-xs text-gray-500">Chronological history of all stock additions, event reservations, staff takings, returns, and damages.</p>

            <div className="mt-4 space-y-2.5">
              {transactions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No transaction logs found.</p>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl border border-gray-100 bg-[#fdfcfb] text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                        tx.type === "CREATED" || tx.type === "ADDED" ? "bg-emerald-100 text-emerald-800" :
                        tx.type === "TAKEN" ? "bg-blue-100 text-blue-800" :
                        tx.type === "RETURNED" || tx.type === "VERIFIED" ? "bg-teal-100 text-teal-800" :
                        tx.type === "DAMAGED" || tx.type === "LOST" ? "bg-rose-100 text-rose-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {tx.type}
                      </span>
                      <div>
                        <span className="font-extrabold text-[#29241f]">
                          {typeof tx.stockItem === "object" ? tx.stockItem?.name : "Item"}
                        </span>
                        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{tx.notes || "Transaction recorded"}</p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-gray-400 shrink-0">
                      <p className="font-bold text-gray-700">By: {tx.performedBy?.name || "System"}</p>
                      <p>{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE STOCK ITEM */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#29241f]">Create Master Stock Item</h3>
              <button type="button" onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner Plate, Wine Glass, Banquet Table"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 font-medium outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as StockCategory })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 font-bold text-gray-700 outline-none focus:border-[#9a6c37]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700">Unit of Measure</label>
                  <input
                    type="text"
                    placeholder="pcs, sets, boxes"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Total Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItem.totalQuantity}
                    onChange={(e) => setNewItem({ ...newItem, totalQuantity: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 font-bold outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">Min Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.minStockLevel}
                    onChange={(e) => setNewItem({ ...newItem, minStockLevel: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700">Storage Location</label>
                <input
                  type="text"
                  placeholder="Warehouse A - Shelf 3"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 font-medium outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#29241f] px-5 py-2 text-xs font-extrabold text-white hover:bg-black"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESTOCK ITEM */}
      {/* ========================================================================= */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#29241f]">Restock: {restockItem.name}</h3>
            <p className="text-xs text-gray-500">Current available: {restockItem.availableQuantity} {restockItem.unit}</p>

            <form onSubmit={handleRestock} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700">Quantity to Add ({restockItem.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 font-black text-emerald-800 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Restock Note / Invoice Reference</label>
                <input
                  type="text"
                  placeholder="Purchased new batch / vendor receipt"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 font-medium outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-emerald-800"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VERIFY RETURN */}
      {/* ========================================================================= */}
      {verifyAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#29241f]">Confirm Return Verification</h3>
            <p className="text-xs text-gray-600">
              Verifying return of <strong>{verifyAllocation.returnedQuantity} {verifyAllocation.stockItem?.unit}</strong> of{" "}
              <strong>{verifyAllocation.stockItem?.name}</strong> back into warehouse available inventory.
            </p>

            <div className="bg-[#faf8f5] p-3 rounded-xl text-xs space-y-1">
              <p>Damaged: <strong className="text-amber-800">{verifyAllocation.damagedQuantity || 0}</strong></p>
              <p>Lost: <strong className="text-rose-800">{verifyAllocation.lostQuantity || 0}</strong></p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">Manager Verification Notes (Optional)</label>
              <input
                type="text"
                placeholder="Inspected and restocked on shelf"
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setVerifyAllocation(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyReturn}
                className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-emerald-800"
              >
                Approve & Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REPORT DISCREPANCY */}
      {/* ========================================================================= */}
      {discrepancyAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-rose-900">Report Stock Return Discrepancy</h3>
            <p className="text-xs text-gray-600">
              Explain why the physically counted items do not match what staff submitted for{" "}
              <strong>{discrepancyAllocation.stockItem?.name}</strong>.
            </p>

            <div>
              <label className="text-xs font-bold text-gray-700">Discrepancy Explanation *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Box contained only 280 plates instead of 290 submitted. 10 plates missing from crate."
                value={discrepancyNotes}
                onChange={(e) => setDiscrepancyNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDiscrepancyAllocation(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!discrepancyNotes.trim()}
                onClick={handleReportDiscrepancy}
                className="rounded-xl bg-rose-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-rose-800 disabled:opacity-50"
              >
                Submit Discrepancy Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

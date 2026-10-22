"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Edit3,
  RotateCcw,
  History,
  ShieldAlert,
  Loader2,
  X,
  IndianRupee,
  Layers,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  getStockItemById,
  updateStockItem,
  addStock,
  verifyStockReturn,
  reportDiscrepancy,
} from "@/lib/stock.api";
import type {
  StockItem,
  StockCategory,
  EventStockAllocation,
  StockTransaction,
} from "@/types/stock";

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
  "Raw Ingredients",
  "Kitchen Supplies",
  "Other",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StockItemDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const stockItemId = resolvedParams.id;
  const { token } = useAuth();

  const [item, setItem] = useState<StockItem | null>(null);
  const [allocations, setAllocations] = useState<EventStockAllocation[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [activeTab, setActiveTab] = useState<"rental" | "details" | "history">("rental");

  // Restock modal state
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockQty, setRestockQty] = useState(10);
  const [restockNotes, setRestockNotes] = useState("");
  const [restockSubmitting, setRestockSubmitting] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<StockItem>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Verification modal state
  const [verifyAllocation, setVerifyAllocation] = useState<EventStockAllocation | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  // Discrepancy modal state
  const [discrepancyAllocation, setDiscrepancyAllocation] = useState<EventStockAllocation | null>(null);
  const [discrepancyNotes, setDiscrepancyNotes] = useState("");
  const [discrepancySubmitting, setDiscrepancySubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const loadItemDetails = useCallback(async () => {
    if (!token || !stockItemId) return;
    try {
      setLoading(true);
      setError("");
      const res = await getStockItemById(stockItemId, token);
      setItem(res.data);
      setTransactions(res.recentTransactions || []);
      setAllocations(res.allocations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [token, stockItemId]);

  useEffect(() => {
    void loadItemDetails();
  }, [loadItemDetails]);

  // Open Edit Modal
  const openEditModal = () => {
    if (!item) return;
    const isKitchen =
      item.stockType === "kitchen" ||
      item.category === "Raw Ingredients" ||
      item.category === "Kitchen Supplies";

    setEditData({
      name: item.name,
      category: item.category,
      minStockLevel: item.minStockLevel,
      unit: item.unit,
      unitPrice: item.unitPrice,
      rentalPrice: isKitchen ? 0 : (item.rentalPrice || 0),
      isRentable: isKitchen ? false : (item.isRentable === true),
      location: item.location,
      description: item.description || "",
    });
    setEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !item) return;
    try {
      setEditSubmitting(true);
      const res = await updateStockItem(item._id, editData, token);
      setItem(res.data);
      showToast("Stock details updated successfully");
      setEditModalOpen(false);
      void loadItemDetails();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update item");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Handle Restock Submit
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !item) return;
    try {
      setRestockSubmitting(true);
      const res = await addStock(item._id, { quantity: restockQty, notes: restockNotes }, token);
      setItem(res.data);
      showToast(`Added ${restockQty} ${item.unit} to stock successfully`);
      setRestockModalOpen(false);
      setRestockNotes("");
      void loadItemDetails();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Restock failed");
    } finally {
      setRestockSubmitting(false);
    }
  };

  // Handle Verify Return Submit
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !verifyAllocation) return;
    try {
      setVerifySubmitting(true);
      await verifyStockReturn(
        verifyAllocation._id,
        {
          approvedReturnedQuantity: verifyAllocation.returnedQuantity,
          approvedDamagedQuantity: verifyAllocation.damagedQuantity,
          approvedLostQuantity: verifyAllocation.lostQuantity,
          verificationNotes: verifyNotes,
        },
        token
      );
      showToast("Return verified and stock restocked successfully");
      setVerifyAllocation(null);
      setVerifyNotes("");
      void loadItemDetails();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifySubmitting(false);
    }
  };

  // Handle Discrepancy Submit
  const handleDiscrepancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !discrepancyAllocation) return;
    try {
      setDiscrepancySubmitting(true);
      await reportDiscrepancy(
        discrepancyAllocation._id,
        { discrepancyNotes },
        token
      );
      showToast("Discrepancy flagged for supervisor review");
      setDiscrepancyAllocation(null);
      setDiscrepancyNotes("");
      void loadItemDetails();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to report discrepancy");
    } finally {
      setDiscrepancySubmitting(false);
    }
  };

  if (loading && !item) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#9a6c37]" />
          <p className="text-xs font-semibold text-gray-500">Loading stock details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    const isAccessDenied =
      error?.toLowerCase().includes("access denied") ||
      error?.toLowerCase().includes("restricted");

    return (
      <div className="space-y-4 max-w-lg mx-auto py-12 text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            isAccessDenied
              ? "bg-amber-100 text-amber-800 border border-amber-200"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {isAccessDenied ? "Access Restricted" : "Stock Item Not Found"}
        </h2>
        <p className="text-xs text-gray-500">
          {error || "The requested product does not exist or was removed."}
        </p>
        <Link
          href="/manager/stock"
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black"
        >
          <ArrowLeft size={14} />
          <span>Back to Stock & Equipment</span>
        </Link>
      </div>
    );
  }

  const isLowStock = item.availableQuantity <= (item.minStockLevel || 10);
  const activeRentalAllocations = allocations.filter(
    (a) => a.status !== "VERIFIED" && a.status !== "CLOSED"
  );
  const pendingReturnAllocations = allocations.filter(
    (a) => a.status === "RETURN_PENDING" || a.status === "DISCREPANCY"
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/manager/stock"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-2xs hover:border-[#9a6c37]/50 hover:bg-[#faf8f5] transition active:scale-95 cursor-pointer"
            title="Back to Stock Inventory"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                {item.category}
              </span>
              {item.stockType === "kitchen" || item.category === "Raw Ingredients" || item.category === "Kitchen Supplies" ? (
                <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Kitchen Operational Stock
                </span>
              ) : item.isRentable === true ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <BadgeCheck size={11} className="text-emerald-600" />
                  Client Rentable
                </span>
              ) : (
                <span className="rounded-md bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                  Company Internal Use
                </span>
              )}
              {isLowStock && (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-black uppercase text-rose-700 animate-pulse">
                  <AlertTriangle size={11} /> Low Stock Alert
                </span>
              )}
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#29241f]">
              {item.name}
            </h1>
          </div>
        </div>

        {/* Action Buttons: Restock & Edit ONLY (No Delete) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 hover:border-gray-300 transition active:scale-95 cursor-pointer"
          >
            <Edit3 size={15} />
            <span>Edit Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRestockQty(10);
              setRestockNotes("");
              setRestockModalOpen(true);
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-800 transition active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Restock Item</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics Card */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Available Units */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Available Stock
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-black ${
                isLowStock ? "text-rose-700" : "text-emerald-700"
              }`}
            >
              {item.availableQuantity}
            </span>
            <span className="text-xs font-bold text-gray-500">{item.unit}</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium">Ready for allocation</p>
        </div>

        {/* Total Stock & Threshold */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Total Inventory
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-gray-900">{item.totalQuantity}</span>
            <span className="text-xs font-bold text-gray-500">{item.unit}</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Min Alert: {item.minStockLevel || 10} {item.unit}</p>
        </div>

        {/* Active Rentals / Allocations */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
            In Use
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-700">
              {(item.reservedQuantity || 0) + (item.inUseQuantity || 0)}
            </span>
            <span className="text-xs font-bold text-gray-500">{item.unit}</span>
          </div>
          <p className="mt-1 text-[11px] text-blue-700 font-medium">
            Active in event rentals
          </p>
        </div>

        {/* Damaged / Lost */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
            Damaged / Lost
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-700">
              {(item.damagedQuantity || 0) + (item.lostQuantity || 0)}
            </span>
            <span className="text-xs font-bold text-gray-500">{item.unit}</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-700 font-medium">
            {item.damagedQuantity || 0} damaged · {item.lostQuantity || 0} missing
          </p>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("rental")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "rental"
              ? "border-[#9a6c37] text-[#9a6c37]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Calendar size={16} />
          <span>Rental Status & Event Allocations ({allocations.length})</span>
          {pendingReturnAllocations.length > 0 && (
            <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-black text-white">
              {pendingReturnAllocations.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "details"
              ? "border-[#9a6c37] text-[#9a6c37]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <FileText size={16} />
          <span>Stock Specifications & Pricing</span>
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
          <span>Stock Audit Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: RENTAL STATUS & ACTIVE EVENT ALLOCATIONS */}
      {/* ========================================================================= */}
      {activeTab === "rental" && (
        <div className="space-y-4">
          {/* Active / Current Event Usage */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#29241f]">
                  Active Event Allocations & Rentals
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time status of this item allocated across events, in-use shifts, and pending returns.
                </p>
              </div>

              {item.stockType !== "kitchen" && item.category !== "Raw Ingredients" && item.category !== "Kitchen Supplies" && item.isRentable === true && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-900">
                  <IndianRupee size={13} className="text-emerald-700" />
                  <span>Rental Rate: ₹{item.rentalPrice || 0} / {item.unit}</span>
                </div>
              )}
            </div>

            {allocations.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Calendar size={36} className="mx-auto text-gray-300" />
                <p className="mt-2 text-sm font-bold text-gray-700">No event allocations on record</p>
                <p className="text-xs text-gray-400">
                  When this item is assigned or rented to events, its status will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {allocations.map((alloc) => {
                  const ev = typeof alloc.event === "object" ? alloc.event : null;
                  const isPendingVerification = alloc.status === "RETURN_PENDING";

                  return (
                    <div
                      key={alloc._id}
                      className={`rounded-2xl border p-4 sm:p-5 transition ${
                        isPendingVerification
                          ? "border-amber-300 bg-amber-50/20 shadow-xs"
                          : "border-gray-200 bg-[#fdfcfb] hover:border-[#9a6c37]/30"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm text-[#29241f]">
                              {ev?.eventName || "Event Shift"}
                            </h4>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                alloc.status === "TAKEN_BY_STAFF"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : alloc.status === "RETURN_PENDING"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : alloc.status === "VERIFIED"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {alloc.status.replace(/_/g, " ")}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1 font-semibold text-[#9a6c37]">
                              <Calendar size={13} />
                              {ev?.eventDate ? new Date(ev.eventDate).toLocaleDateString() : "Date TBD"}
                            </span>
                            {ev?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={13} />
                                {ev.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <User size={13} />
                              Staff: {alloc.assignedStaff?.name || "Unassigned"}
                            </span>
                          </div>
                        </div>

                        {/* Quantities Overview */}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="rounded-xl bg-white border border-gray-100 px-3 py-1.5 shadow-2xs text-center">
                            <p className="text-[10px] uppercase font-bold text-gray-400">Allocated</p>
                            <p className="font-black text-gray-900 text-sm">
                              {alloc.takenQuantity || alloc.requiredQuantity} {item.unit}
                            </p>
                          </div>

                          {alloc.returnedQuantity > 0 && (
                            <div className="rounded-xl bg-white border border-gray-100 px-3 py-1.5 shadow-2xs text-center">
                              <p className="text-[10px] uppercase font-bold text-emerald-700">Returned</p>
                              <p className="font-black text-emerald-700 text-sm">
                                {alloc.returnedQuantity} {item.unit}
                              </p>
                            </div>
                          )}

                          {alloc.damagedQuantity > 0 && (
                            <div className="rounded-xl bg-white border border-gray-100 px-3 py-1.5 shadow-2xs text-center">
                              <p className="text-[10px] uppercase font-bold text-rose-700">Damaged</p>
                              <p className="font-black text-rose-700 text-sm">
                                {alloc.damagedQuantity} {item.unit}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes / Actions for Pending Verification */}
                      {isPendingVerification && (
                        <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-amber-200/60 pt-3">
                          <p className="text-xs text-amber-900 font-medium">
                            Staff has marked stock as returned. Ready for verification and restock.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDiscrepancyAllocation(alloc);
                                setDiscrepancyNotes("");
                              }}
                              className="rounded-lg border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-amber-900 hover:bg-amber-50 cursor-pointer"
                            >
                              Report Issue
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyAllocation(alloc);
                                setVerifyNotes("");
                              }}
                              className="rounded-lg bg-emerald-700 px-3.5 py-1 text-xs font-extrabold text-white hover:bg-emerald-800 shadow-2xs cursor-pointer"
                            >
                              Verify Return
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: PRODUCT SPECIFICATIONS & DETAILS */}
      {/* ========================================================================= */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Specifications */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#29241f] border-b border-gray-100 pb-3">
              Item Information & Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Item Name</span>
                <span className="font-extrabold text-gray-900">{item.name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Category</span>
                <span className="font-bold text-[#9a6c37]">{item.category}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Storage Location</span>
                <span className="font-medium text-gray-800">{item.location || "Central Warehouse"}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Unit of Measure</span>
                <span className="font-medium text-gray-800">{item.unit || "pcs"}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Min Alert Threshold</span>
                <span className="font-bold text-rose-700">{item.minStockLevel || 10} {item.unit}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Item ID / SKU</span>
                <span className="font-mono text-[11px] text-gray-400">{item._id}</span>
              </div>

              <div>
                <span className="font-bold text-gray-500 block mb-1">Description / Notes</span>
                <p className="rounded-xl bg-[#faf8f5] p-3 text-gray-700 text-xs leading-relaxed border border-gray-100 italic">
                  {item.description || "No description provided for this stock equipment."}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Rental Policy */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#29241f] border-b border-gray-100 pb-3">
              Rental & Valuation Policy
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Rental Availability</span>
                {item.stockType === "kitchen" || item.category === "Raw Ingredients" || item.category === "Kitchen Supplies" ? (
                  <span className="font-bold text-amber-700">
                    Kitchen Consumption (Non-Rentable)
                  </span>
                ) : (
                  <span className={`font-bold ${item.isRentable === true ? "text-emerald-700" : "text-gray-500"}`}>
                    {item.isRentable === true ? "Available for Client Hire" : "Company Internal Use Only"}
                  </span>
                )}
              </div>

              {item.stockType !== "kitchen" && item.category !== "Raw Ingredients" && item.category !== "Kitchen Supplies" && (
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="font-bold text-gray-500">Client Rental Rate</span>
                  <span className="font-extrabold text-emerald-800 text-sm">
                    {item.isRentable === true ? `₹${item.rentalPrice || 0} / ${item.unit}` : "N/A (Internal Equipment)"}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Unit Replacement Value</span>
                <span className="font-extrabold text-gray-900 text-sm">
                  ₹{item.unitPrice || 0}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Total Asset Valuation</span>
                <span className="font-extrabold text-gray-900">
                  ₹{((item.totalQuantity || 0) * (item.unitPrice || 0)).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="rounded-xl bg-amber-50/60 border border-amber-200/80 p-3.5 space-y-1">
                <p className="font-bold text-amber-900 text-xs">Rental Operational Rule</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  When assigned to an event, stock is allocated as in-use and deducted from Available inventory. Upon event conclusion, staff return goods which are verified by managers before returning to Available stock.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: STOCK AUDIT HISTORY & LEDGER */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#29241f]">Stock Transaction Audit History</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete historical record of all restocks, event allocations, takes, returns, and write-offs.
              </p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <History size={36} className="mx-auto text-gray-300" />
              <p className="mt-2 text-sm font-bold text-gray-700">No transactions recorded yet</p>
              <p className="text-xs text-gray-400">Restock additions and event allocations will be logged here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-[#faf8f5] text-[11px] font-bold text-gray-500">
                  <tr>
                    <th className="px-3.5 py-3">Timestamp</th>
                    <th className="px-3.5 py-3">Action</th>
                    <th className="px-3.5 py-3 text-center">Qty Change</th>
                    <th className="px-3.5 py-3 text-center">Available Stock</th>
                    <th className="px-3.5 py-3">Event / Context</th>
                    <th className="px-3.5 py-3">Performed By</th>
                    <th className="px-3.5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => {
                    const isPositive = tx.quantity > 0 && (tx.type === "ADDED" || tx.type === "RETURNED" || tx.type === "UNRESERVED");
                    return (
                      <tr key={tx._id} className="hover:bg-gray-50/70 transition">
                        <td className="px-3.5 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              tx.type === "ADDED"
                                ? "bg-emerald-100 text-emerald-800"
                                : tx.type === "RETURNED"
                                ? "bg-teal-100 text-teal-800"
                                : tx.type === "TAKEN"
                                ? "bg-blue-100 text-blue-800"
                                : tx.type === "DAMAGED" || tx.type === "LOST"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-stone-100 text-stone-800"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-center font-extrabold whitespace-nowrap">
                          <span className={isPositive ? "text-emerald-700" : "text-gray-900"}>
                            {isPositive ? `+${tx.quantity}` : tx.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-center font-bold text-gray-600 whitespace-nowrap">
                          {tx.previousAvailable} → <span className="text-gray-900 font-extrabold">{tx.newAvailable}</span>
                        </td>
                        <td className="px-3.5 py-3 text-gray-700 max-w-[150px] truncate">
                          {tx.event ? tx.event.eventName : "Warehouse Restock"}
                        </td>
                        <td className="px-3.5 py-3 text-gray-600 whitespace-nowrap">
                          {tx.performedBy?.name || "System"}
                        </td>
                        <td className="px-3.5 py-3 text-gray-500 max-w-[200px] truncate">
                          {tx.notes || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESTOCK ITEM */}
      {/* ========================================================================= */}
      {restockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#29241f]">Restock Inventory</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setRestockModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700">Quantity to Add ({item.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-base font-black text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Current total: <span className="font-bold">{item.totalQuantity}</span> → New total: <span className="font-black text-emerald-700">{item.totalQuantity + (restockQty || 0)}</span> {item.unit}
                </p>
              </div>

              <div>
                <label className="font-bold text-gray-700">Restock Notes / Vendor Details</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Received new shipment from vendor, replaced damaged units"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  disabled={restockSubmitting}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={restockSubmitting}
                  className="rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-800 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {restockSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Restocking...</span>
                    </>
                  ) : (
                    <span>Confirm Restock</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT STOCK ITEM DETAILS */}
      {/* ========================================================================= */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#29241f]">Edit Stock Item Details</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700">Item Name *</label>
                <input
                  type="text"
                  required
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Category *</label>
                  <select
                    value={editData.category}
                    onChange={(e) => {
                      const newCat = e.target.value as StockCategory;
                      const isNowKitchen = newCat === "Raw Ingredients" || newCat === "Kitchen Supplies";
                      setEditData({
                        ...editData,
                        category: newCat,
                        isRentable: isNowKitchen ? false : editData.isRentable,
                        rentalPrice: isNowKitchen ? 0 : editData.rentalPrice,
                      });
                    }}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-bold text-gray-700 outline-none focus:border-[#9a6c37]"
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
                    value={editData.unit || ""}
                    onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Unit Purchase Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editData.unitPrice || 0}
                    onChange={(e) => setEditData({ ...editData, unitPrice: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>

                {editData.category !== "Raw Ingredients" && editData.category !== "Kitchen Supplies" ? (
                  <div>
                    <label className="font-bold text-gray-700">Client Rental Rate (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editData.rentalPrice || 0}
                      onChange={(e) => setEditData({ ...editData, rentalPrice: Number(e.target.value) })}
                      className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-bold text-emerald-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-gray-400">Client Rental Rate</label>
                    <div className="mt-1 flex h-10 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-400">
                      Not Rentable
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold text-gray-700">Min Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    value={editData.minStockLevel || 10}
                    onChange={(e) => setEditData({ ...editData, minStockLevel: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              {editData.category === "Raw Ingredients" || editData.category === "Kitchen Supplies" ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <p className="font-bold">Internal Kitchen Item (Non-Rentable)</p>
                  <p className="mt-0.5 text-[11px] text-amber-700 leading-relaxed">
                    Raw ingredients and consumables are reserved for internal kitchen use and cannot be rented to clients.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isRentableEdit"
                    checked={editData.isRentable === true}
                    onChange={(e) => setEditData({ ...editData, isRentable: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="isRentableEdit" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Available for Client Rental
                  </label>
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700">Storage Location</label>
                <input
                  type="text"
                  value={editData.location || ""}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Description / Specs</label>
                <textarea
                  rows={3}
                  value={editData.description || ""}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={editSubmitting}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-xl bg-[#29241f] px-5 py-2 text-xs font-extrabold text-white hover:bg-black cursor-pointer flex items-center gap-2"
                >
                  {editSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#29241f]">Confirm Return Verification</h3>
              <button
                type="button"
                onClick={() => setVerifyAllocation(null)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-xs space-y-1">
                <p className="font-bold text-emerald-900">
                  Restock Confirmation
                </p>
                <p className="text-emerald-800 text-[11px]">
                  Confirming verification will return <span className="font-extrabold">{verifyAllocation.returnedQuantity} {item.unit}</span> into Available Stock inventory.
                </p>
              </div>

              <div>
                <label className="font-bold text-gray-700">Verification Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Count confirmed in good condition"
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setVerifyAllocation(null)}
                  disabled={verifySubmitting}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifySubmitting}
                  className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-emerald-800 cursor-pointer flex items-center gap-2"
                >
                  {verifySubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Verify & Restock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REPORT DISCREPANCY */}
      {/* ========================================================================= */}
      {discrepancyAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-rose-800">Flag Return Discrepancy</h3>
              <button
                type="button"
                onClick={() => setDiscrepancyAllocation(null)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDiscrepancySubmit} className="space-y-4 text-xs">
              <p className="text-gray-600 text-xs leading-relaxed">
                Report a count discrepancy or physical damage mismatch for this item return before approval.
              </p>

              <div>
                <label className="font-bold text-gray-700">Discrepancy Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. 5 dinner plates were reported broken during transit, or missing items"
                  value={discrepancyNotes}
                  onChange={(e) => setDiscrepancyNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-rose-200 p-2.5 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDiscrepancyAllocation(null)}
                  disabled={discrepancySubmitting}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={discrepancySubmitting}
                  className="rounded-xl bg-rose-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-rose-800 cursor-pointer flex items-center gap-2"
                >
                  {discrepancySubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Submit Discrepancy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

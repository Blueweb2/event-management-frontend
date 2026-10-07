"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  getMyAssignedStock,
  takeStock,
  returnStock,
  takeEventStock,
  returnEventStock,
} from "@/lib/stock.api";
import type { EventStock, StockMovement } from "@/types/stock";
import Link from "next/link";

export default function StaffStockPage() {
  const [assignedStocks, setAssignedStocks] = useState<EventStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active Tab: 'collect' | 'in_use' | 'returns' | 'history'
  const [activeTab, setActiveTab] = useState<"collect" | "in_use" | "returns" | "history">("collect");

  // Modals
  const [takeModalItem, setTakeModalItem] = useState<EventStock | null>(null);
  const [returnModalItem, setReturnModalItem] = useState<EventStock | null>(null);

  // Take Form
  const [takeForm, setTakeForm] = useState({
    takenQuantity: 0,
    takeNotes: "",
  });

  // Return Form
  const [returnForm, setReturnForm] = useState({
    returnedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    damagedReason: "",
    lostReason: "",
    returnNotes: "",
  });

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyAssignedStock();
      if (res.success) {
        setAssignedStocks(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  // Open Take Modal
  const openTakeModal = (stock: EventStock) => {
    setTakeModalItem(stock);
    setTakeForm({
      takenQuantity: stock.requiredQuantity || 1,
      takeNotes: "",
    });
    setError(null);
    setSuccessMsg(null);
  };

  // Open Return Modal
  const openReturnModal = (stock: EventStock) => {
    setReturnModalItem(stock);
    setReturnForm({
      returnedQuantity: stock.takenQuantity || 0,
      damagedQuantity: 0,
      lostQuantity: 0,
      damagedReason: "",
      lostReason: "",
      returnNotes: "",
    });
    setError(null);
    setSuccessMsg(null);
  };

  // Submit Take Stock
  const handleTakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!takeModalItem) return;

    if (takeForm.takenQuantity <= 0) {
      setError("Please specify a valid quantity to take.");
      return;
    }

    // If actual taken differs from required/expected, require notes
    if (takeForm.takenQuantity !== takeModalItem.requiredQuantity && !takeForm.takeNotes.trim()) {
      setError(`Quantity differs from expected (${takeModalItem.requiredQuantity}). Please provide an explanation note.`);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const res = await takeStock(takeModalItem._id, {
        takenQuantity: Number(takeForm.takenQuantity),
        takeNotes: takeForm.takeNotes,
      });

      if (res.success) {
        setSuccessMsg(`Successfully confirmed collection of ${takeForm.takenQuantity} units.`);
        setTakeModalItem(null);
        fetchStock();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to confirm stock collection.");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Return Stock
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalItem) return;

    const ret = Number(returnForm.returnedQuantity) || 0;
    const dmg = Number(returnForm.damagedQuantity) || 0;
    const lost = Number(returnForm.lostQuantity) || 0;
    const totalAccounted = ret + dmg + lost;
    const expected = returnModalItem.takenQuantity;

    // Strict validation
    if (totalAccounted !== expected) {
      setError(`Quantities do not match! Taken: ${expected}, Accounted: ${totalAccounted} (${Math.abs(expected - totalAccounted)} items unaccounted for).`);
      return;
    }

    if (dmg > 0 && !returnForm.damagedReason.trim()) {
      setError("Please provide a reason/explanation for the damaged items.");
      return;
    }

    if (lost > 0 && !returnForm.lostReason.trim()) {
      setError("Please provide a reason/explanation for the lost/missing items.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const res = await returnStock(returnModalItem._id, {
        returnedQuantity: ret,
        damagedQuantity: dmg,
        lostQuantity: lost,
        damagedReason: returnForm.damagedReason,
        lostReason: returnForm.lostReason,
        returnNotes: returnForm.returnNotes,
        returnedAt: new Date().toISOString(),
      });

      if (res.success) {
        setSuccessMsg("Stock return submitted! Awaiting manager verification.");
        setReturnModalItem(null);
        fetchStock();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to submit stock return.");
    } finally {
      setActionLoading(false);
    }
  };

  // Categorize assigned stocks
  const toCollect = assignedStocks.filter((s) => s.status === "PLANNED" || s.status === "RESERVED" || s.status === "READY_FOR_COLLECTION");
  const inPossession = assignedStocks.filter((s) => s.status === "TAKEN_BY_STAFF" || s.status === "AT_EVENT");
  const returnPendingOrDiscrepancy = assignedStocks.filter((s) => s.status === "RETURN_PENDING" || s.status === "DISCREPANCY");
  const closedOrReturned = assignedStocks.filter((s) => s.status === "RETURNED" || s.status === "VERIFIED" || s.status === "CLOSED");

  // Live reconciliation calculations for Return Modal
  const returnTotalAccounted = (Number(returnForm.returnedQuantity) || 0) + (Number(returnForm.damagedQuantity) || 0) + (Number(returnForm.lostQuantity) || 0);
  const returnExpected = returnModalItem?.takenQuantity || 0;
  const isReturnBalanced = returnTotalAccounted === returnExpected;
  const returnDiff = returnExpected - returnTotalAccounted;

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 text-[#252525]">
      {/* Top Banner Header */}
      <div className="sticky top-0 z-30 border-b border-[#e8e1d8] bg-white/90 backdrop-blur-md px-4 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f7f3ee] text-[#9a6c37]">
              <Package size={22} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#252525]">My Event Stock &amp; Equipment</h1>
              <p className="text-[11px] font-medium text-gray-500">Collect equipment, manage custody, and return post-event</p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchStock}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-[#9a6c37]" : ""} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="mx-auto mt-3 flex max-w-4xl gap-1 overflow-x-auto no-scrollbar rounded-2xl bg-gray-100/80 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("collect")}
            className={`flex-1 min-w-[90px] rounded-xl py-2 px-2 text-center transition ${
              activeTab === "collect"
                ? "bg-white text-[#9a6c37] shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            To Collect ({toCollect.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("in_use")}
            className={`flex-1 min-w-[90px] rounded-xl py-2 px-2 text-center transition ${
              activeTab === "in_use"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            In Possession ({inPossession.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("returns")}
            className={`flex-1 min-w-[90px] rounded-xl py-2 px-2 text-center transition ${
              activeTab === "returns"
                ? "bg-white text-purple-600 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Returns ({returnPendingOrDiscrepancy.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 min-w-[90px] rounded-xl py-2 px-2 text-center transition ${
              activeTab === "history"
                ? "bg-white text-gray-800 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            History ({closedOrReturned.length})
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-4">
        {/* Global Notifications / Alerts */}
        {error && (
          <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 shadow-2xs">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700 shadow-2xs">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Discrepancy Alert Banner if any */}
        {returnPendingOrDiscrepancy.some((s) => s.status === "DISCREPANCY") && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-800">
                  Manager Discrepancy Flagged
                </h3>
                <p className="mt-1 text-xs text-red-700">
                  One or more returned items have an unresolved count discrepancy reported by the manager. Please review below and re-submit reconciled quantities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <RefreshCw size={28} className="animate-spin text-[#9a6c37]" />
            <p className="mt-3 text-xs font-semibold text-gray-600">Loading your assigned stock...</p>
          </div>
        ) : (
          <div>
            {/* TAB 1: TO COLLECT */}
            {activeTab === "collect" && (
              <div className="space-y-3">
                {toCollect.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#e8e1d8] bg-white p-8 text-center shadow-2xs">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                    <h3 className="mt-2 text-sm font-bold text-gray-800">No Pending Collections</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      You have collected all stock assigned to you for upcoming events.
                    </p>
                  </div>
                ) : (
                  toCollect.map((stock) => {
                    const event = typeof stock.eventId === "object" ? stock.eventId : (stock as any).event;
                    const item = typeof stock.stockItemId === "object" ? stock.stockItemId : (stock as any).stockItem;
                    return (
                      <div
                        key={stock._id}
                        className="rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                              <Clock size={10} /> Ready for Collection
                            </span>
                            <h3 className="mt-1 text-sm font-extrabold text-[#252525]">
                              {event?.eventName || "Event Equipment"}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              {event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : ""} &bull; {event?.location || "Venue"}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Expected</span>
                            <div className="text-lg font-black text-[#9a6c37]">
                              {stock.requiredQuantity} <span className="text-xs font-normal text-gray-500">{item?.unit || "pcs"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Return schedule badge if assigned by manager */}
                        {stock.expectedReturnAt && (
                          <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-indigo-50/60 px-3 py-1.5 text-xs font-semibold text-indigo-800 border border-indigo-100/80">
                            <Clock size={13} className="text-indigo-600" />
                            <span>
                              Scheduled Return: {new Date(stock.expectedReturnAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })},{" "}
                              {new Date(stock.expectedReturnAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                              <Package size={18} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#252525]">{item?.name || "Equipment Item"}</div>
                              <div className="text-[11px] text-gray-400">SKU: {item?.sku || "N/A"} &bull; {item?.category || "Equipment"}</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => openTakeModal(stock)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#9a6c37] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#855c2d] active:scale-[0.98] transition"
                          >
                            <Package size={14} />
                            Take Stock
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: IN POSSESSION / AT EVENT */}
            {activeTab === "in_use" && (
              <div className="space-y-3">
                {inPossession.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#e8e1d8] bg-white p-8 text-center shadow-2xs">
                    <Package size={36} className="mx-auto text-gray-300" />
                    <h3 className="mt-2 text-sm font-bold text-gray-800">No Stock in Custody</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      You are not currently holding any event stock. Check &quot;To Collect&quot; when preparing for an event.
                    </p>
                  </div>
                ) : (
                  inPossession.map((stock) => {
                    const event = typeof stock.eventId === "object" ? stock.eventId : (stock as any).event;
                    const item = typeof stock.stockItemId === "object" ? stock.stockItemId : (stock as any).stockItem;
                    return (
                      <div
                        key={stock._id}
                        className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                              <ShieldCheck size={10} /> In Your Possession / At Event
                            </span>
                            <h3 className="mt-1 text-sm font-extrabold text-[#252525]">
                              {event?.eventName || "Event Equipment"}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              {event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : ""} &bull; {event?.location || "Venue"}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Taken</span>
                            <div className="text-lg font-black text-indigo-600">
                              {stock.takenQuantity} <span className="text-xs font-normal text-gray-500">{item?.unit || "pcs"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Timestamp Badges: Collection Time and Expected Return Time */}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {stock.takenAt && (
                            <div className="flex items-center gap-1 rounded-xl bg-gray-50 px-2.5 py-1 text-gray-600 border border-gray-100">
                              <span className="font-semibold text-gray-500">Collected:</span>
                              <span className="font-bold text-gray-800">
                                {new Date(stock.takenAt).toLocaleDateString([], { month: "short", day: "numeric" })},{" "}
                                {new Date(stock.takenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          )}

                          {stock.expectedReturnAt && (
                            <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-amber-800 border border-amber-100 font-medium">
                              <Clock size={12} className="text-amber-600" />
                              <span className="font-semibold">Return By:</span>
                              <span className="font-bold">
                                {new Date(stock.expectedReturnAt).toLocaleDateString([], { month: "short", day: "numeric" })},{" "}
                                {new Date(stock.expectedReturnAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <Package size={18} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#252525]">{item?.name || "Equipment Item"}</div>
                              <div className="text-[11px] text-gray-400">SKU: {item?.sku || "N/A"}</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => openReturnModal(stock)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition"
                          >
                            <RotateCcw size={14} />
                            Return Stock
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: RETURN PENDING & DISCREPANCIES */}
            {activeTab === "returns" && (
              <div className="space-y-3">
                {returnPendingOrDiscrepancy.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#e8e1d8] bg-white p-8 text-center shadow-2xs">
                    <ShieldCheck size={36} className="mx-auto text-emerald-500" />
                    <h3 className="mt-2 text-sm font-bold text-gray-800">No Pending Returns</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      All your returns have been verified and approved by the manager.
                    </p>
                  </div>
                ) : (
                  returnPendingOrDiscrepancy.map((stock) => {
                    const event = typeof stock.eventId === "object" ? stock.eventId : (stock as any).event;
                    const item = typeof stock.stockItemId === "object" ? stock.stockItemId : (stock as any).stockItem;
                    const isDiscrepancy = stock.status === "DISCREPANCY";
                    return (
                      <div
                        key={stock._id}
                        className={`rounded-3xl border p-5 shadow-sm transition ${
                          isDiscrepancy ? "border-red-200 bg-red-50/30" : "border-purple-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isDiscrepancy
                                  ? "bg-red-100 text-red-800"
                                  : "bg-purple-100 text-purple-800 animate-pulse"
                              }`}
                            >
                              {isDiscrepancy ? <AlertCircle size={10} /> : <Clock size={10} />}
                              {isDiscrepancy ? "Discrepancy Action Required" : "Awaiting Manager Plate Approval"}
                            </span>
                            <h3 className="mt-1 text-sm font-extrabold text-[#252525]">
                              {event?.eventName || "Event Equipment"}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              {event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : ""}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Total Taken</span>
                            <div className="text-base font-bold text-gray-900">{stock.takenQuantity}</div>
                          </div>
                        </div>

                        {/* Submission time */}
                        {stock.returnedAt && (
                          <div className="mt-2 text-[11px] text-gray-400">
                            Submitted on {new Date(stock.returnedAt).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(stock.returnedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}

                        {/* Breakdown summary */}
                        <div className="mt-3 rounded-2xl bg-gray-50 p-3 text-xs grid grid-cols-3 gap-2 text-center border border-gray-100">
                          <div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold">Good Condition</div>
                            <div className="font-bold text-emerald-700 text-sm">+{stock.returnedQuantity}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold">Damaged Plates</div>
                            <div className="font-bold text-amber-700 text-sm">{stock.damagedQuantity}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold">Lost / Missing</div>
                            <div className="font-bold text-red-700 text-sm">{stock.lostQuantity}</div>
                          </div>
                        </div>

                        {stock.damagedReason && (
                          <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-100">
                            <span className="font-bold">Damaged Reason:</span> {stock.damagedReason}
                          </div>
                        )}
                        {stock.lostReason && (
                          <div className="mt-2 text-[11px] text-red-800 bg-red-50 p-2 rounded-xl border border-red-100">
                            <span className="font-bold">Lost Reason:</span> {stock.lostReason}
                          </div>
                        )}

                        {isDiscrepancy && (
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-red-600 font-medium">Please re-verify counts:</span>
                            <button
                              type="button"
                              onClick={() => openReturnModal(stock)}
                              className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition"
                            >
                              Re-Submit Return
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 4: HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-3">
                {closedOrReturned.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#e8e1d8] bg-white p-8 text-center shadow-2xs">
                    <Clock size={36} className="mx-auto text-gray-300" />
                    <h3 className="mt-2 text-sm font-bold text-gray-800">No Past History</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Closed and manager-approved stock records will appear here for your reference.
                    </p>
                  </div>
                ) : (
                  closedOrReturned.map((stock) => {
                    const event = typeof stock.eventId === "object" ? stock.eventId : (stock as any).event;
                    const item = typeof stock.stockItemId === "object" ? stock.stockItemId : (stock as any).stockItem;
                    return (
                      <div
                        key={stock._id}
                        className="rounded-3xl border border-gray-200 bg-white p-4 shadow-2xs"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 size={10} /> Verified &amp; Approved by Manager
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {stock.verifiedAt ? new Date(stock.verifiedAt).toLocaleDateString() : (event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : "")}
                          </span>
                        </div>
                        <div className="mt-2 flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold text-gray-900">{item?.name || "Equipment"}</h4>
                            <p className="text-[11px] text-gray-500">{event?.eventName || "Event"}</p>
                            {stock.takenAt && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Collected: {new Date(stock.takenAt).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                                {new Date(stock.takenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs">
                            <div className="font-bold text-gray-700">Taken: {stock.takenQuantity}</div>
                            <div className="font-bold text-emerald-700">
                              Restocked: {stock.approvedReturnedQuantity ?? stock.returnedQuantity}
                            </div>
                            {(stock.approvedDamagedQuantity || stock.damagedQuantity) ? (
                              <div className="font-bold text-amber-700">
                                Damaged: {stock.approvedDamagedQuantity ?? stock.damagedQuantity}
                              </div>
                            ) : null}
                            {(stock.approvedLostQuantity || stock.lostQuantity) ? (
                              <div className="font-bold text-red-700">
                                Lost: {stock.approvedLostQuantity ?? stock.lostQuantity}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {stock.managerNotes && (
                          <div className="mt-2 rounded-xl bg-gray-50 p-2 text-[11px] text-gray-600 border border-gray-100">
                            <span className="font-bold text-gray-700">Manager Remarks:</span> {stock.managerNotes}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: TAKE STOCK CONFIRMATION */}
      {/* ========================================================================= */}
      {takeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#9a6c37]">
                <Package size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#252525]">Confirm Stock Collection</h3>
                <p className="text-xs text-gray-500">
                  {typeof takeModalItem.eventId === "object" ? takeModalItem.eventId.eventName : "Event"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#faf8f5] p-4 text-xs border border-[#e8e1d8]">
              <div className="font-bold text-[#252525] text-sm">
                {typeof takeModalItem.stockItemId === "object" ? takeModalItem.stockItemId.name : "Equipment Item"}
              </div>
              <div className="mt-1 flex justify-between text-gray-500">
                <span>Expected Quantity:</span>
                <span className="font-black text-[#9a6c37] text-sm">
                  {takeModalItem.requiredQuantity} {typeof takeModalItem.stockItemId === "object" ? takeModalItem.stockItemId.unit : "units"}
                </span>
              </div>
            </div>

            <form onSubmit={handleTakeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                  Actual Quantity Received / Taken *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={takeForm.takenQuantity === 0 ? "" : takeForm.takenQuantity}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setTakeForm({ ...takeForm, takenQuantity: val === "" ? ("" as any) : Number(val) });
                  }}
                  onFocus={(e) => e.target.select()}
                  required
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-base font-bold text-gray-900 focus:border-[#9a6c37] focus:outline-none"
                />
              </div>

              {takeForm.takenQuantity !== takeModalItem.requiredQuantity && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>Quantity difference noted ({takeForm.takenQuantity - takeModalItem.requiredQuantity})</span>
                  </div>
                  <label className="block text-[11px] font-bold text-amber-900 mt-2 mb-1">
                    Reason / Note (Required) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={takeForm.takeNotes}
                    onChange={(e) => setTakeForm({ ...takeForm, takeNotes: e.target.value })}
                    placeholder="e.g. 5 plates were unavailable in the store"
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTakeModalItem(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-[#9a6c37] px-5 py-2 text-xs font-bold text-white hover:bg-[#855c2d] shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? "Confirming..." : "Confirm & Take"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RETURN STOCK WITH RECONCILIATION VALIDATION */}
      {/* ========================================================================= */}
      {returnModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <RotateCcw size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#252525]">Return Event Stock</h3>
                <p className="text-xs text-gray-500">
                  {typeof returnModalItem.eventId === "object" ? returnModalItem.eventId.eventName : "Event"}
                </p>
              </div>
            </div>

            {/* Taken Reference Banner */}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 p-4 border border-gray-100">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase">Item to Return</span>
                <div className="font-extrabold text-[#252525] text-sm">
                  {typeof returnModalItem.stockItemId === "object" ? returnModalItem.stockItemId.name : "Item"}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Total Taken</span>
                <div className="font-black text-indigo-600 text-base">{returnModalItem.takenQuantity} units</div>
              </div>
            </div>

            {/* Reconciliation Live Status Box */}
            <div
              className={`mt-4 rounded-2xl border p-4 text-xs transition ${
                isReturnBalanced
                  ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
                  : "border-red-200 bg-red-50/90 text-red-900"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {isReturnBalanced ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-red-600" />}
                  {isReturnBalanced ? "Reconciliation Balanced" : "Quantities Do Not Match"}
                </span>
                <span>
                  {returnTotalAccounted} / {returnExpected} Accounted
                </span>
              </div>

              {!isReturnBalanced && (
                <p className="mt-1.5 text-[11px] font-medium text-red-700 leading-relaxed">
                  ⚠ {Math.abs(returnDiff)} items are {returnDiff > 0 ? "unaccounted for" : "over-counted"}. (Returned + Damaged + Lost must equal Taken quantity of {returnExpected}).
                </p>
              )}
            </div>

            <form onSubmit={handleReturnSubmit} className="mt-5 space-y-4">
              {/* Returned in Good Condition */}
              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  1. Returned in Good Condition (units) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={returnForm.returnedQuantity === 0 ? "" : returnForm.returnedQuantity}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setReturnForm({ ...returnForm, returnedQuantity: val === "" ? 0 : Number(val) });
                  }}
                  onFocus={(e) => e.target.select()}
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-emerald-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Damaged */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-3.5 space-y-2">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    2. Damaged Items (units)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={returnForm.damagedQuantity === 0 ? "" : returnForm.damagedQuantity}
                    placeholder="0"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setReturnForm({ ...returnForm, damagedQuantity: val === "" ? 0 : Number(val) });
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-bold text-amber-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {returnForm.damagedQuantity > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Reason for Damage (Required) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={returnForm.damagedReason}
                      onChange={(e) => setReturnForm({ ...returnForm, damagedReason: e.target.value })}
                      placeholder="e.g. 3 glasses cracked during transportation"
                      className="w-full rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Lost / Missing */}
              <div className="rounded-2xl border border-red-100 bg-red-50/30 p-3.5 space-y-2">
                <div>
                  <label className="block text-xs font-bold text-red-900 mb-1">
                    3. Lost / Missing Items (units)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={returnForm.lostQuantity === 0 ? "" : returnForm.lostQuantity}
                    placeholder="0"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setReturnForm({ ...returnForm, lostQuantity: val === "" ? 0 : Number(val) });
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-bold text-red-900 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {returnForm.lostQuantity > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-red-900 mb-1">
                      Reason for Loss (Required) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={returnForm.lostReason}
                      onChange={(e) => setReturnForm({ ...returnForm, lostReason: e.target.value })}
                      placeholder="e.g. 3 plates missing after event cleanup"
                      className="w-full rounded-xl border border-red-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Additional Return Notes</label>
                <textarea
                  rows={2}
                  value={returnForm.returnNotes}
                  onChange={(e) => setReturnForm({ ...returnForm, returnNotes: e.target.value })}
                  placeholder="Optional general notes regarding the return..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-[#9a6c37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReturnModalItem(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isReturnBalanced || actionLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Submitting..." : "Submit Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

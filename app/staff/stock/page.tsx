"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Clock,
  ShieldCheck,
  Search,
  Mail,
  Sparkles,
  X,
  Send,
  BookmarkCheck,
  AlertCircle,
  Truck,
} from "lucide-react";
import {
  getStockItems,
  getMyAssignedStock,
  holdStock,
  releaseStockHold,
  takeStock,
  returnStock,
} from "@/lib/stock.api";
import { useAuth } from "@/hooks/useAuth";
import type { StockItem, EventStock } from "@/types/stock";
import { formatTime24to12 } from "@/lib/time-utils";

export default function StaffStockPage() {
  const { user } = useAuth();

  const isKitchenAuthorized = React.useMemo(() => {
    if (!user) return false;
    const role = (user.role || "").toLowerCase();
    if (role === "superadmin" || role === "admin") return true;
    const dept = (user.department || "").toLowerCase();
    return (
      dept.includes("kitchen") ||
      dept.includes("catering") ||
      dept.includes("chef") ||
      dept.includes("cook") ||
      dept.includes("operation")
    );
  }, [user]);

  const categories = React.useMemo(() => {
    if (isKitchenAuthorized) {
      return [
        { label: "All Items", value: "ALL" },
        { label: "Kitchen Equipment", value: "Kitchen Equipment" },
        { label: "Raw Ingredients", value: "Raw Ingredients" },
        { label: "Kitchen Supplies", value: "Kitchen Supplies" },
        { label: "Crockery", value: "Crockery" },
        { label: "Glassware", value: "Glassware" },
        { label: "Cutlery", value: "Cutlery" },
        { label: "Furniture", value: "Furniture" },
        { label: "Audio/Visual", value: "Audio/Visual" },
        { label: "Linen", value: "Linen" },
        { label: "Decor", value: "Decor" },
        { label: "Lighting", value: "Lighting" },
        { label: "Other", value: "Other" },
      ];
    }
    return [
      { label: "All Items", value: "ALL" },
      { label: "Crockery", value: "Crockery" },
      { label: "Glassware", value: "Glassware" },
      { label: "Cutlery", value: "Cutlery" },
      { label: "Furniture", value: "Furniture" },
      { label: "Audio/Visual", value: "Audio/Visual" },
      { label: "Linen", value: "Linen" },
      { label: "Decor", value: "Decor" },
      { label: "Lighting", value: "Lighting" },
      { label: "Other", value: "Other" },
    ];
  }, [isKitchenAuthorized]);

  // Main Navigation Tabs
  // 'catalog' = Browse & Hold Stock
  // 'held' = My Active Holds (Ready to Take / Release)
  // 'custody' = In My Possession (In Use / Return)
  // 'history' = Returns & Verification History
  const [activeTab, setActiveTab] = useState<"catalog" | "held" | "custody" | "history">("catalog");

  // Data States
  const [catalogItems, setCatalogItems] = useState<StockItem[]>([]);
  const [assignedStocks, setAssignedStocks] = useState<EventStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Catalog Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Modals
  const [holdModalItem, setHoldModalItem] = useState<StockItem | null>(null);
  const [takeModalStock, setTakeModalStock] = useState<EventStock | null>(null);
  const [returnModalStock, setReturnModalStock] = useState<EventStock | null>(null);

  // Hold Form
  const [holdForm, setHoldForm] = useState({
    quantity: 1,
    notes: "",
    expectedReturnAt: "",
  });

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

  // Fetch all stock data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [itemsRes, assignedRes] = await Promise.all([
        getStockItems({ limit: 200 }),
        getMyAssignedStock(),
      ]);

      if (itemsRes?.data) {
        setCatalogItems(itemsRes.data);
      } else if (Array.isArray(itemsRes)) {
        setCatalogItems(itemsRes);
      }

      if (assignedRes?.data) {
        setAssignedStocks(assignedRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load stock inventory data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Hold Stock Modal Open
  const openHoldModal = (item: StockItem) => {
    setHoldModalItem(item);
    setHoldForm({
      quantity: 1,
      notes: "",
      expectedReturnAt: "",
    });
    setError(null);
    setSuccessMsg(null);
  };

  // Submit Hold Stock
  const handleHoldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdModalItem) return;

    const qty = Number(holdForm.quantity);
    if (qty <= 0) {
      setError("Please specify a valid hold quantity of at least 1.");
      return;
    }
    if (qty > holdModalItem.availableQuantity) {
      setError(`Requested quantity (${qty}) exceeds available stock (${holdModalItem.availableQuantity}).`);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const res = await holdStock({
        stockItemId: holdModalItem._id,
        quantity: qty,
        notes: holdForm.notes,
        expectedReturnAt: holdForm.expectedReturnAt || undefined,
      });

      if (res.success) {
        setSuccessMsg(
          `Success! Booked ${qty} ${holdModalItem.unit || "items"} of "${holdModalItem.name}". Your manager has been notified.`
        );
        setHoldModalItem(null);
        await fetchData();
        setActiveTab("held");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to book item.");
    } finally {
      setActionLoading(false);
    }
  };

  // Release Hold
  const handleReleaseHold = async (stock: EventStock) => {
    const item = typeof stock.stockItemId === "object" ? stock.stockItemId : (stock as any).stockItem;
    const confirmRelease = window.confirm(
      `Are you sure you want to cancel the booking for ${stock.reservedQuantity || stock.requiredQuantity} ${item?.unit || "items"} of "${item?.name || "this item"}"?`
    );
    if (!confirmRelease) return;

    try {
      setActionLoading(true);
      setError(null);
      const res = await releaseStockHold(stock._id);
      if (res.success) {
        setSuccessMsg("Booking cancelled. The item is now available for others.");
        await fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to cancel booking.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Take Modal
  const openTakeModal = (stock: EventStock) => {
    setTakeModalStock(stock);
    setTakeForm({
      takenQuantity: stock.reservedQuantity || stock.requiredQuantity || 1,
      takeNotes: "",
    });
    setError(null);
    setSuccessMsg(null);
  };

  // Submit Take Stock
  const handleTakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!takeModalStock) return;

    const qty = Number(takeForm.takenQuantity);
    if (qty <= 0) {
      setError("Please enter a valid quantity to take.");
      return;
    }

    const expected = takeModalStock.reservedQuantity || takeModalStock.requiredQuantity;
    if (qty !== expected && !takeForm.takeNotes.trim()) {
      setError(`Quantity is different from what was booked (${expected}). Please add a short note explaining why.`);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const res = await takeStock(takeModalStock._id, {
        takenQuantity: qty,
        takeNotes: takeForm.takeNotes,
      });

      if (res.success) {
        setSuccessMsg(`Picked up ${qty} items successfully.`);
        setTakeModalStock(null);
        await fetchData();
        setActiveTab("custody");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to confirm item pickup.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Return Modal
  const openReturnModal = (stock: EventStock) => {
    setReturnModalStock(stock);
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

  // Submit Return Stock
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalStock) return;

    const ret = Number(returnForm.returnedQuantity) || 0;
    const dmg = Number(returnForm.damagedQuantity) || 0;
    const lost = Number(returnForm.lostQuantity) || 0;
    const totalAccounted = ret + dmg + lost;
    const expected = returnModalStock.takenQuantity || 0;

    if (totalAccounted !== expected) {
      setError(`Numbers don't match! You took ${expected}, but counted ${totalAccounted} (${Math.abs(expected - totalAccounted)} items difference).`);
      return;
    }

    if (dmg > 0 && !returnForm.damagedReason.trim()) {
      setError("Please write what happened to the damaged items.");
      return;
    }

    if (lost > 0 && !returnForm.lostReason.trim()) {
      setError("Please write what happened to the lost or missing items.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const res = await returnStock(returnModalStock._id, {
        returnedQuantity: ret,
        damagedQuantity: dmg,
        lostQuantity: lost,
        damagedReason: returnForm.damagedReason,
        lostReason: returnForm.lostReason,
        returnNotes: returnForm.returnNotes,
        returnedAt: new Date().toISOString(),
      });

      if (res.success) {
        setSuccessMsg("Return submitted! Your manager will check and verify the items.");
        setReturnModalStock(null);
        await fetchData();
        setActiveTab("history");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to submit return.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Catalog Items
  const filteredCatalog = catalogItems.filter((item) => {
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
    if (onlyAvailable && item.availableQuantity <= 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchSku = item.sku?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat) return false;
    }
    return true;
  });

  // Categorize staff allocations
  const heldStocks = assignedStocks.filter(
    (s) => s.status === "PLANNED" || s.status === "RESERVED" || s.status === "READY_FOR_COLLECTION"
  );
  const custodyStocks = assignedStocks.filter(
    (s) => s.status === "TAKEN_BY_STAFF" || s.status === "AT_EVENT"
  );
  const historyStocks = assignedStocks.filter(
    (s) => s.status === "RETURNED" || s.status === "VERIFIED" || s.status === "CLOSED" || s.status === "RETURN_PENDING" || s.status === "DISCREPANCY"
  );

  // Return reconciliation math
  const returnAccounted = (Number(returnForm.returnedQuantity) || 0) + (Number(returnForm.damagedQuantity) || 0) + (Number(returnForm.lostQuantity) || 0);
  const returnTarget = returnModalStock?.takenQuantity || 0;
  const isReturnBalanced = returnAccounted === returnTarget;
  const returnDiff = returnTarget - returnAccounted;

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 text-[#252525]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 border-b border-[#e8e1d8] bg-white/95 backdrop-blur-md px-4 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f3ee] text-[#9a6c37]">
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-[#252525]">Items &amp; Equipment</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-800">
                  <Sparkles size={10} /> Available Now
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Book items, pick them up, and return them when finished
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            title="Refresh Items"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-[#9a6c37]" : ""} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto mt-3 flex max-w-5xl gap-1.5 overflow-x-auto no-scrollbar rounded-2xl bg-gray-100/90 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center justify-center gap-1.5 flex-1 min-w-[130px] rounded-xl py-2 px-3 text-center transition ${
              activeTab === "catalog"
                ? "bg-white text-[#9a6c37] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Layers size={14} />
            <span>All Items ({catalogItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("held")}
            className={`flex items-center justify-center gap-1.5 flex-1 min-w-[130px] rounded-xl py-2 px-3 text-center transition ${
              activeTab === "held"
                ? "bg-white text-amber-800 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <BookmarkCheck size={14} />
            <span>My Booked Items ({heldStocks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custody")}
            className={`flex items-center justify-center gap-1.5 flex-1 min-w-[130px] rounded-xl py-2 px-3 text-center transition ${
              activeTab === "custody"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ShieldCheck size={14} />
            <span>Items With Me ({custodyStocks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center justify-center gap-1.5 flex-1 min-w-[130px] rounded-xl py-2 px-3 text-center transition ${
              activeTab === "history"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <RotateCcw size={14} />
            <span>Returned Items ({historyStocks.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl px-4 pt-4">
        {/* Alerts & Messages */}
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <RefreshCw size={32} className="animate-spin text-[#9a6c37]" />
            <p className="mt-3 text-xs font-bold text-gray-600">Loading items...</p>
          </div>
        ) : (
          <div>
            {/* ========================================================================= */}
            {/* TAB 1: ALL ITEMS (Browse & Book) */}
            {/* ========================================================================= */}
            {activeTab === "catalog" && (
              <div className="space-y-4">
                {/* Search & Filter Header Bar */}
                <div className="rounded-3xl border border-[#e8e1d8] bg-white p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search item name, code, or category..."
                        className="w-full rounded-2xl border border-gray-200 bg-[#faf8f5] pl-10 pr-4 py-2 text-xs font-semibold text-[#252525] placeholder:text-gray-400 focus:border-[#9a6c37] focus:bg-white focus:outline-none"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer rounded-2xl border border-gray-200 bg-[#faf8f5] px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition">
                        <input
                          type="checkbox"
                          checked={onlyAvailable}
                          onChange={(e) => setOnlyAvailable(e.target.checked)}
                          className="rounded text-[#9a6c37] focus:ring-0"
                        />
                        <span>Available Only</span>
                      </label>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                          selectedCategory === cat.value
                            ? "bg-[#9a6c37] text-white shadow-2xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Callout */}
                <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-2.5 text-xs font-medium text-amber-900 shadow-2xs">
                  <Mail size={16} className="text-[#9a6c37] shrink-0" />
                  <span>
                    When you book an item, it is saved for you in the store and an email alert is sent to your manager.
                  </span>
                </div>

                {/* Stock Cards Grid */}
                {filteredCatalog.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#e8e1d8] bg-white p-12 text-center shadow-2xs">
                    <Package size={40} className="mx-auto text-gray-300" />
                    <h3 className="mt-3 text-sm font-bold text-gray-800">No Items Found</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Try searching with different words or categories.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCatalog.map((item) => {
                      const isOutOfStock = item.availableQuantity <= 0;
                      const isLowStock = !isOutOfStock && item.availableQuantity <= (item.minStockLevel || 10);

                      return (
                        <div
                          key={item._id}
                          className="flex flex-col justify-between rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#9a6c37]/40"
                        >
                          <div>
                            {/* Header / Category & SKU */}
                            <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                              <div>
                                <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-gray-600">
                                  {item.category || "Equipment"}
                                </span>
                                <h3 className="mt-1 text-sm font-black text-[#252525]">{item.name}</h3>
                                <p className="text-[11px] text-gray-400">
                                  Code: {item.sku || "N/A"} {item.location ? `• Place: ${item.location}` : ""}
                                </p>
                              </div>

                              {/* Availability Status Badge */}
                              <div>
                                {isOutOfStock ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-red-800 uppercase">
                                    Out of Stock
                                  </span>
                                ) : isLowStock ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase">
                                    Available
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Live Quantities Counter Grid */}
                            <div className="mt-3.5 grid grid-cols-4 gap-2 rounded-2xl bg-[#faf8f5] p-3 text-center border border-[#e8e1d8]">
                              <div className="rounded-xl bg-white p-1.5 shadow-2xs">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Available</div>
                                <div className="text-base font-black text-emerald-700">
                                  {item.availableQuantity}
                                </div>
                              </div>
                              <div className="rounded-xl bg-white p-1.5 shadow-2xs">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Booked</div>
                                <div className="text-base font-black text-amber-700">
                                  {item.reservedQuantity}
                                </div>
                              </div>
                              <div className="rounded-xl bg-white p-1.5 shadow-2xs">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Taken</div>
                                <div className="text-base font-black text-indigo-700">
                                  {item.inUseQuantity}
                                </div>
                              </div>
                              <div className="rounded-xl bg-white p-1.5 shadow-2xs">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Total</div>
                                <div className="text-base font-black text-gray-800">
                                  {item.totalQuantity}
                                </div>
                              </div>
                            </div>

                            {item.description && (
                              <p className="mt-2 text-[11px] text-gray-500 line-clamp-2">{item.description}</p>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">
                              Unit: <span className="font-bold text-gray-800">{item.unit || "pcs"}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => openHoldModal(item)}
                              disabled={isOutOfStock}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#9a6c37] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#855c2d] active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <BookmarkCheck size={14} />
                              Book This Item
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: MY BOOKED ITEMS (Ready to Pick Up or Cancel) */}
            {/* ========================================================================= */}
            {activeTab === "held" && (
              <div className="space-y-3">
                {heldStocks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#e8e1d8] bg-white p-12 text-center shadow-2xs">
                    <BookmarkCheck size={40} className="mx-auto text-gray-300" />
                    <h3 className="mt-3 text-sm font-bold text-gray-800">No Booked Items</h3>
                    <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
                      You haven&apos;t booked any items yet. Go to the &quot;All Items&quot; tab to select what you need.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("catalog")}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#9a6c37] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#855c2d]"
                    >
                      Browse All Items
                    </button>
                  </div>
                ) : (
                  heldStocks.map((stock) => {
                    const event = (stock.eventId && typeof stock.eventId === "object" ? stock.eventId : (stock as any).event) || null;
                    const item = (stock.stockItemId && typeof stock.stockItemId === "object" ? stock.stockItemId : (stock as any).stockItem) || null;
                    const holdQty = stock.reservedQuantity || stock.requiredQuantity;

                    return (
                      <div
                        key={stock._id}
                        className="rounded-3xl border border-amber-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-800 border border-amber-200">
                              <BookmarkCheck size={11} /> Booked (Saved for You)
                            </span>
                            <h3 className="mt-1 text-sm font-extrabold text-[#252525]">
                              {item?.name || "Equipment Item"}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              Code: {item?.sku || "N/A"} &bull; Category: {item?.category || "Equipment"}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Booked Amount</span>
                            <div className="text-lg font-black text-[#9a6c37]">
                              {holdQty} <span className="text-xs font-normal text-gray-500">{item?.unit || "pcs"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Event / Usage Details */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="rounded-xl bg-gray-50 p-2.5 border border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Event / Reason</span>
                            <span className="font-bold text-gray-800">
                              {event?.eventName || stock.takeNotes || "General Staff Work"}
                            </span>
                          </div>

                          {stock.expectedReturnAt && (
                            <div className="rounded-xl bg-gray-50 p-2.5 border border-gray-100">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Date Needed</span>
                              <span className="font-bold text-gray-800">
                                {new Date(stock.expectedReturnAt).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {stock.takeNotes && (
                          <div className="mt-2 text-xs text-gray-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                            <span className="font-bold text-amber-900">Notes:</span> {stock.takeNotes}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleReleaseHold(stock)}
                            disabled={actionLoading}
                            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition"
                          >
                            Cancel Booking
                          </button>

                          <button
                            type="button"
                            onClick={() => openTakeModal(stock)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#9a6c37] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#855c2d] active:scale-[0.98] transition"
                          >
                            <Truck size={14} />
                            Pick Up / Take Item
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: ITEMS WITH ME (Currently In Use) */}
            {/* ========================================================================= */}
            {activeTab === "custody" && (
              <div className="space-y-3">
                {custodyStocks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#e8e1d8] bg-white p-12 text-center shadow-2xs">
                    <ShieldCheck size={40} className="mx-auto text-gray-300" />
                    <h3 className="mt-3 text-sm font-bold text-gray-800">No Items With You</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      You don&apos;t have any items checked out right now. Check &quot;My Booked Items&quot; to pick up your gear.
                    </p>
                  </div>
                ) : (
                  custodyStocks.map((stock) => {
                    const event = (stock.eventId && typeof stock.eventId === "object" ? stock.eventId : (stock as any).event) || null;
                    const item = (stock.stockItemId && typeof stock.stockItemId === "object" ? stock.stockItemId : (stock as any).stockItem) || null;

                    return (
                      <div
                        key={stock._id}
                        className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 border border-indigo-200">
                              <ShieldCheck size={11} /> With You (In Use)
                            </span>
                            <h3 className="mt-1 text-sm font-extrabold text-[#252525]">
                              {item?.name || "Equipment Item"}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              Code: {item?.sku || "N/A"} &bull; {event?.eventName || "Staff Work"}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400">You Have</span>
                            <div className="text-lg font-black text-indigo-700">
                              {stock.takenQuantity} <span className="text-xs font-normal text-gray-500">{item?.unit || "pcs"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {stock.takenAt && (
                            <div className="flex items-center gap-1 rounded-xl bg-gray-50 px-2.5 py-1 text-gray-600 border border-gray-100">
                              <span className="font-semibold text-gray-500">Picked Up:</span>
                              <span className="font-bold text-gray-800">
                                {new Date(stock.takenAt).toLocaleDateString([], { month: "short", day: "numeric" })},{" "}
                                {formatTime24to12(stock.takenAt)}
                              </span>
                            </div>
                          )}

                          {stock.expectedReturnAt && (
                            <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-amber-800 border border-amber-100 font-medium">
                              <Clock size={12} className="text-amber-600" />
                              <span className="font-semibold">Return By:</span>
                              <span className="font-bold">
                                {new Date(stock.expectedReturnAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">Done using this item?</span>

                          <button
                            type="button"
                            onClick={() => openReturnModal(stock)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition"
                          >
                            <RotateCcw size={14} />
                            Return Item
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: RETURNED ITEMS & MANAGER CHECK */}
            {/* ========================================================================= */}
            {activeTab === "history" && (
              <div className="space-y-3">
                {historyStocks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#e8e1d8] bg-white p-12 text-center shadow-2xs">
                    <RotateCcw size={40} className="mx-auto text-gray-300" />
                    <h3 className="mt-3 text-sm font-bold text-gray-800">No Returned Items Yet</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Items you return will show up here after the manager checks them.
                    </p>
                  </div>
                ) : (
                  historyStocks.map((stock) => {
                    const event = (stock.eventId && typeof stock.eventId === "object" ? stock.eventId : (stock as any).event) || null;
                    const item = (stock.stockItemId && typeof stock.stockItemId === "object" ? stock.stockItemId : (stock as any).stockItem) || null;
                    const isPending = stock.status === "RETURN_PENDING";
                    const isDiscrepancy = stock.status === "DISCREPANCY";
                    const isVerified = stock.status === "VERIFIED" || stock.status === "CLOSED" || stock.status === "RETURNED";

                    return (
                      <div
                        key={stock._id}
                        className={`rounded-3xl border p-5 shadow-sm transition ${
                          isDiscrepancy
                            ? "border-red-200 bg-red-50/40"
                            : isPending
                            ? "border-purple-200 bg-purple-50/20"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            {isPending && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-purple-800 animate-pulse">
                                <Clock size={10} /> Waiting for Manager to Check
                              </span>
                            )}
                            {isDiscrepancy && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-red-800">
                                <AlertCircle size={10} /> Issue Found (Damaged or Missing)
                              </span>
                            )}
                            {isVerified && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-800">
                                <CheckCircle2 size={10} /> Checked &amp; Returned to Store
                              </span>
                            )}

                            <h3 className="mt-1 text-sm font-extrabold text-[#252525]">{item?.name || "Item"}</h3>
                            <p className="text-[11px] text-gray-400">
                              {event?.eventName || "Staff Work"}{" "}
                              {stock.returnedAt ? `• Returned on ${new Date(stock.returnedAt).toLocaleDateString()}` : ""}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Total Taken</span>
                            <div className="text-base font-bold text-gray-800">
                              {stock.takenQuantity} {item?.unit || "units"}
                            </div>
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
                            <div className="text-[10px] font-bold text-emerald-800 uppercase">Returned Good</div>
                            <div className="text-sm font-black text-emerald-700">
                              +{stock.approvedReturnedQuantity ?? stock.returnedQuantity}
                            </div>
                          </div>
                          <div className="rounded-xl bg-amber-50 p-2 border border-amber-100">
                            <div className="text-[10px] font-bold text-amber-800 uppercase">Damaged</div>
                            <div className="text-sm font-black text-amber-700">
                              {stock.approvedDamagedQuantity ?? stock.damagedQuantity ?? 0}
                            </div>
                          </div>
                          <div className="rounded-xl bg-red-50 p-2 border border-red-100">
                            <div className="text-[10px] font-bold text-red-800 uppercase">Lost / Missing</div>
                            <div className="text-sm font-black text-red-700">
                              {stock.approvedLostQuantity ?? stock.lostQuantity ?? 0}
                            </div>
                          </div>
                        </div>

                        {stock.damagedReason && (
                          <div className="mt-2 text-xs text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-100">
                            <span className="font-bold">Reason for Damage:</span> {stock.damagedReason}
                          </div>
                        )}
                        {stock.lostReason && (
                          <div className="mt-2 text-xs text-red-900 bg-red-50 p-2 rounded-xl border border-red-100">
                            <span className="font-bold">Reason for Loss:</span> {stock.lostReason}
                          </div>
                        )}
                        {stock.managerNotes && (
                          <div className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded-xl border border-gray-100">
                            <span className="font-bold">Manager Note:</span> {stock.managerNotes}
                          </div>
                        )}

                        {isDiscrepancy && (
                          <div className="mt-3 pt-2 border-t border-red-100 flex items-center justify-between">
                            <span className="text-xs text-red-700 font-semibold">Manager asked to re-check:</span>
                            <button
                              type="button"
                              onClick={() => openReturnModal(stock)}
                              className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition"
                            >
                              Submit Return Again
                            </button>
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
      {/* MODAL 1: BOOK ITEM MODAL (With Manager Email Notification Callout) */}
      {/* ========================================================================= */}
      {holdModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#9a6c37]">
                  <BookmarkCheck size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#252525]">Book / Reserve Item</h3>
                  <p className="text-xs text-gray-500">Save item for your upcoming shift or event</p>
                </div>
              </div>
              <button
                onClick={() => setHoldModalItem(null)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Item Details Summary Card */}
            <div className="mt-4 rounded-2xl bg-[#faf8f5] p-4 text-xs border border-[#e8e1d8]">
              <div className="font-bold text-[#252525] text-sm">{holdModalItem.name}</div>
              <div className="mt-1 flex justify-between text-gray-600">
                <span>Category:</span>
                <span className="font-bold text-gray-800">{holdModalItem.category}</span>
              </div>
              <div className="mt-1 flex justify-between text-gray-600">
                <span>Available to Book:</span>
                <span className="font-black text-emerald-700 text-sm">
                  {holdModalItem.availableQuantity} {holdModalItem.unit || "units"}
                </span>
              </div>
            </div>

            {/* Manager Email Alert Callout */}
            <div className="mt-3.5 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
              <Mail size={16} className="text-[#9a6c37] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Manager Alert:</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Booking this will save the item and send an email alert to the manager with your details and notes.
                </p>
              </div>
            </div>

            <form onSubmit={handleHoldSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                  How many do you need? *
                </label>
                <input
                  type="number"
                  min="1"
                  max={holdModalItem.availableQuantity}
                  value={holdForm.quantity}
                  onChange={(e) => setHoldForm({ ...holdForm, quantity: Number(e.target.value) })}
                  required
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-base font-bold text-gray-900 focus:border-[#9a6c37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date Needed (Optional)
                </label>
                <input
                  type="date"
                  value={holdForm.expectedReturnAt}
                  onChange={(e) => setHoldForm({ ...holdForm, expectedReturnAt: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-800 focus:border-[#9a6c37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Why do you need it? (Notes for manager)
                </label>
                <textarea
                  rows={2}
                  value={holdForm.notes}
                  onChange={(e) => setHoldForm({ ...holdForm, notes: e.target.value })}
                  placeholder="e.g. Needed for evening dinner shift..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-800 focus:border-[#9a6c37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setHoldModalItem(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || holdModalItem.availableQuantity <= 0}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#9a6c37] px-5 py-2 text-xs font-bold text-white hover:bg-[#855c2d] shadow-sm transition disabled:opacity-50"
                >
                  <Send size={14} />
                  {actionLoading ? "Booking..." : "Confirm & Book Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PICK UP ITEM MODAL */}
      {/* ========================================================================= */}
      {takeModalStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f3ee] text-[#9a6c37]">
                  <Truck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#252525]">Pick Up Item</h3>
                  <p className="text-xs text-gray-500">Confirm you are taking this item now</p>
                </div>
              </div>
              <button
                onClick={() => setTakeModalStock(null)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {(() => {
              const item =
                typeof takeModalStock.stockItemId === "object" && takeModalStock.stockItemId !== null
                  ? takeModalStock.stockItemId
                  : typeof (takeModalStock as any).stockItem === "object" && (takeModalStock as any).stockItem !== null
                  ? (takeModalStock as any).stockItem
                  : null;

              return (
                <div className="mt-4 rounded-2xl bg-[#faf8f5] p-4 text-xs border border-[#e8e1d8]">
                  <div className="font-bold text-[#252525] text-sm">
                    {item?.name || "Item"}
                  </div>
                  <div className="mt-1 flex justify-between text-gray-500">
                    <span>Saved for You:</span>
                    <span className="font-black text-[#9a6c37] text-sm">
                      {takeModalStock.reservedQuantity || takeModalStock.requiredQuantity}{" "}
                      {item?.unit || "units"}
                    </span>
                  </div>
                </div>
              );
            })()}

            <form onSubmit={handleTakeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                  How many are you taking? *
                </label>
                <input
                  type="number"
                  min="1"
                  value={takeForm.takenQuantity}
                  onChange={(e) => setTakeForm({ ...takeForm, takenQuantity: Number(e.target.value) })}
                  required
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-base font-bold text-gray-900 focus:border-[#9a6c37] focus:outline-none"
                />
              </div>

              {takeForm.takenQuantity !== (takeModalStock.reservedQuantity || takeModalStock.requiredQuantity) && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>Number is different from booked amount</span>
                  </div>
                  <label className="block text-[11px] font-bold text-amber-900 mt-2 mb-1">
                    Please tell us why (Required) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={takeForm.takeNotes}
                    onChange={(e) => setTakeForm({ ...takeForm, takeNotes: e.target.value })}
                    placeholder="e.g. Took less because fewer guests showed up..."
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setTakeModalStock(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-[#9a6c37] px-5 py-2 text-xs font-bold text-white hover:bg-[#855c2d] shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? "Picking up..." : "Confirm & Pick Up Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RETURN ITEM MODAL (With Friendly Count Check) */}
      {/* ========================================================================= */}
      {returnModalStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <RotateCcw size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#252525]">Return Item to Store</h3>
                  <p className="text-xs text-gray-500">Tell us how many are in good condition, damaged, or lost</p>
                </div>
              </div>
              <button
                onClick={() => setReturnModalStock(null)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Reference */}
            {(() => {
              const item =
                typeof returnModalStock.stockItemId === "object" && returnModalStock.stockItemId !== null
                  ? returnModalStock.stockItemId
                  : typeof (returnModalStock as any).stockItem === "object" && (returnModalStock as any).stockItem !== null
                  ? (returnModalStock as any).stockItem
                  : null;

              return (
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Item to Return</span>
                    <div className="font-extrabold text-[#252525] text-sm">
                      {item?.name || "Item"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Total You Took</span>
                    <div className="font-black text-indigo-600 text-base">{returnModalStock.takenQuantity} {item?.unit || "units"}</div>
                  </div>
                </div>
              );
            })()}

            {/* Live Balanced Reconciliation Indicator */}
            <div
              className={`mt-4 rounded-2xl border p-4 text-xs transition ${
                isReturnBalanced
                  ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
                  : "border-red-200 bg-red-50/90 text-red-900"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {isReturnBalanced ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-600" />
                  )}
                  {isReturnBalanced ? "Count is Correct" : "Total count must equal what you took"}
                </span>
                <span>
                  {returnAccounted} / {returnTarget} Counted
                </span>
              </div>

              {!isReturnBalanced && (
                <p className="mt-1.5 text-[11px] font-medium text-red-700">
                  ⚠ {Math.abs(returnDiff)} items are {returnDiff > 0 ? "missing from your count" : "counted too many"}. (Good + Damaged + Lost must add up to {returnTarget}).
                </p>
              )}
            </div>

            <form onSubmit={handleReturnSubmit} className="mt-5 space-y-4">
              {/* Returned in Good Condition */}
              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  1. How many in Good Condition? *
                </label>
                <input
                  type="number"
                  min="0"
                  max={returnTarget}
                  value={returnForm.returnedQuantity}
                  onChange={(e) => setReturnForm({ ...returnForm, returnedQuantity: Number(e.target.value) })}
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-emerald-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Damaged */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-3.5 space-y-2">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    2. How many Damaged?
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={returnTarget}
                    value={returnForm.damagedQuantity}
                    onChange={(e) => setReturnForm({ ...returnForm, damagedQuantity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-bold text-amber-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {returnForm.damagedQuantity > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      What happened to the damaged items? *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={returnForm.damagedReason}
                      onChange={(e) => setReturnForm({ ...returnForm, damagedReason: e.target.value })}
                      placeholder="e.g. Cracked or broke during the event..."
                      className="w-full rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Lost */}
              <div className="rounded-2xl border border-red-100 bg-red-50/30 p-3.5 space-y-2">
                <div>
                  <label className="block text-xs font-bold text-red-900 mb-1">
                    3. How many Lost or Missing?
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={returnTarget}
                    value={returnForm.lostQuantity}
                    onChange={(e) => setReturnForm({ ...returnForm, lostQuantity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-bold text-red-900 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {returnForm.lostQuantity > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-red-900 mb-1">
                      Where or how was it lost? *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={returnForm.lostReason}
                      onChange={(e) => setReturnForm({ ...returnForm, lostReason: e.target.value })}
                      placeholder="e.g. Could not be found after event breakdown..."
                      className="w-full rounded-xl border border-red-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Any other notes? (Optional)</label>
                <textarea
                  rows={2}
                  value={returnForm.returnNotes}
                  onChange={(e) => setReturnForm({ ...returnForm, returnNotes: e.target.value })}
                  placeholder="Optional note for manager..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-[#9a6c37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReturnModalStock(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isReturnBalanced || actionLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Submitting..." : "Submit Return to Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  PackagePlus,
  AlertTriangle,
  CheckCircle2,
  Search,
  Loader2,
  MapPin,
  X,
  BadgeCheck,
  UtensilsCrossed,
  Boxes,
  ArrowRight,
  TrendingDown,
  FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getManagerScope } from "@/lib/manager-navigation";
import {
  getStockItems,
  createStockItem,
  getManagerStockSummary,
} from "@/lib/stock.api";
import type {
  StockItem,
  StockCategory,
  ManagerStockSummary,
} from "@/types/stock";

const KITCHEN_CATEGORIES: StockCategory[] = [
  "Raw Ingredients",
  "Kitchen Supplies",
  "Kitchen Equipment",
];

const RENTABLE_CATEGORIES: StockCategory[] = [
  "Crockery",
  "Glassware",
  "Cutlery",
  "Furniture",
  "Audio/Visual",
  "Linen",
  "Decor",
  "Lighting",
  "Other",
];

export default function ManagerStockPage() {
  const { token, user } = useAuth();

  const scope = useMemo(() => getManagerScope(user), [user]);
  const isAuthorizedKitchen = useMemo(() => {
    if (!user) return false;
    if (scope.isSuperAdmin || scope.isChefManager) return true;
    if (scope.departmentType === "operations") return true;
    return false;
  }, [user, scope]);

  // Active section tab: "kitchen" vs "rentable"
  const [activeTab, setActiveTab] = useState<"kitchen" | "rentable">("rentable");

  // Default to kitchen for chef managers, otherwise rentable
  useEffect(() => {
    if (isAuthorizedKitchen && scope.isChefManager) {
      setActiveTab("kitchen");
    } else {
      setActiveTab("rentable");
    }
  }, [isAuthorizedKitchen, scope.isChefManager]);

  // State
  const [items, setItems] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<ManagerStockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Available categories for the active tab
  const tabCategories = useMemo(() => {
    return activeTab === "kitchen" ? KITCHEN_CATEGORIES : RENTABLE_CATEGORIES;
  }, [activeTab]);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Raw Ingredients" as StockCategory,
    totalQuantity: 50,
    minStockLevel: 10,
    unit: "kg",
    unitPrice: 0,
    rentalPrice: 0,
    isRentable: false,
    stockType: "kitchen" as "kitchen" | "rentable",
    location: "Central Kitchen Pantry",
    description: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Reset category filter when switching tabs
  const handleTabChange = (tab: "kitchen" | "rentable") => {
    if (tab === "kitchen" && !isAuthorizedKitchen) return;
    setActiveTab(tab);
    setCategoryFilter("ALL");
    setLowStockFilter(false);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");

      const requestedStockType = isAuthorizedKitchen ? activeTab : "rentable";
      const [itemsRes, summaryRes] = await Promise.all([
        getStockItems(token, {
          search,
          stockType: requestedStockType,
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
          lowStock: lowStockFilter ? true : undefined,
        }),
        getManagerStockSummary(token),
      ]);

      setItems(itemsRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, search, categoryFilter, lowStockFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Open modal pre-configured for the active section
  const handleOpenCreateModal = () => {
    if (activeTab === "kitchen") {
      setNewItem({
        name: "",
        category: "Raw Ingredients",
        totalQuantity: 50,
        minStockLevel: 10,
        unit: "kg",
        unitPrice: 0,
        rentalPrice: 0,
        isRentable: false,
        stockType: "kitchen",
        location: "Central Kitchen Pantry",
        description: "",
      });
    } else {
      setNewItem({
        name: "",
        category: "Crockery",
        totalQuantity: 50,
        minStockLevel: 10,
        unit: "pcs",
        unitPrice: 0,
        rentalPrice: 0,
        isRentable: false,
        stockType: "rentable",
        location: "Central Warehouse",
        description: "",
      });
    }
    setCreateModalOpen(true);
  };

  // Handle Create Stock Item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setCreateSubmitting(true);

      const isKitchenCategory =
        newItem.category === "Raw Ingredients" ||
        newItem.category === "Kitchen Supplies" ||
        newItem.stockType === "kitchen";

      const payload = {
        ...newItem,
        stockType: isKitchenCategory ? ("kitchen" as const) : ("rentable" as const),
        isRentable: isKitchenCategory ? false : newItem.isRentable,
        rentalPrice: isKitchenCategory ? 0 : newItem.rentalPrice,
      };

      await createStockItem(payload, token);
      showToast(`Stock item "${newItem.name}" created successfully`);
      setCreateModalOpen(false);
      void loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create item");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Section KPI calculations
  const totalUnits = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0);
  }, [items]);

  const shortagesCount = useMemo(() => {
    return items.filter((i) => i.availableQuantity <= (i.minStockLevel || 10)).length;
  }, [items]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#29241f]">
            {isAuthorizedKitchen ? "Inventory & Stock Management" : "Equipment & Asset Inventory"}
          </h1>
          <p className="mt-1 text-xs text-[#756d64]">
            {isAuthorizedKitchen
              ? "Separated inventory modules for internal kitchen ingredients and client-rentable event equipment."
              : "Department equipment, reusable event supplies, and rentable assets."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#29241f] px-4 text-xs font-extrabold text-white shadow-xs hover:bg-black transition active:scale-95 cursor-pointer"
        >
          <PackagePlus size={16} />
          <span>
            {activeTab === "kitchen" ? "New Kitchen Item" : "New Rentable Asset"}
          </span>
        </button>
      </div>

      {/* Module Navigation Tabs */}
      {isAuthorizedKitchen ? (
        <div className="flex border-b border-[#e8e1d8] bg-white p-1.5 rounded-2xl shadow-2xs gap-1">
          <button
            type="button"
            onClick={() => handleTabChange("kitchen")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-extrabold transition cursor-pointer ${
              activeTab === "kitchen"
                ? "bg-[#29241f] text-white shadow-sm"
                : "text-[#756d64] hover:bg-[#faf7f2] hover:text-[#29241f]"
            }`}
          >
            <UtensilsCrossed size={16} />
            <span>Kitchen Stock & Ingredients</span>
            <span
              className={`ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "kitchen"
                  ? "bg-amber-400 text-stone-900"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              Internal Use
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("rentable")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-extrabold transition cursor-pointer ${
              activeTab === "rentable"
                ? "bg-[#29241f] text-white shadow-sm"
                : "text-[#756d64] hover:bg-[#faf7f2] hover:text-[#29241f]"
            }`}
          >
            <Boxes size={16} />
            <span>Rentable Equipment & Event Supplies</span>
            <span
              className={`ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "rentable"
                  ? "bg-emerald-400 text-stone-900"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              Client Hire
            </span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between border border-[#e8e1d8] bg-white p-3 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#29241f]">
            <Boxes size={18} className="text-[#9a6c37]" />
            <span>Department Equipment & Event Supplies</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
              {scope.roleTitle}
            </span>
          </div>
          <span className="text-[11px] text-[#756d64]">
            Showing operational equipment & hire stock
          </span>
        </div>
      )}

      {/* Section-Specific KPI Summary Cards */}
      {activeTab === "kitchen" ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Kitchen Items Count */}
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/30 p-4 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Kitchen Inventory
            </p>
            <p className="mt-1 text-2xl font-black text-stone-900">{items.length}</p>
            <p className="mt-1 text-[11px] text-stone-500">Raw ingredients & supplies</p>
          </div>

          {/* Available Units in Pantry */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Current Available Stock
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-700">
              {totalUnits.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-emerald-700 font-medium">Ready for meal preparation</p>
          </div>

          {/* Ingredient Shortages Alert */}
          <div
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`rounded-2xl border p-4 shadow-xs cursor-pointer transition ${
              lowStockFilter
                ? "border-rose-400 bg-rose-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Shortages / Low Stock
              </p>
              <TrendingDown size={14} className="text-rose-500" />
            </div>
            <p className="mt-1 text-2xl font-black text-rose-700">{shortagesCount}</p>
            <p className="mt-1 text-[11px] text-rose-600 font-medium">
              {lowStockFilter ? "Showing shortages only" : "Click to view shortages"}
            </p>
          </div>

          {/* Kitchen Purchase Requests Shortcut */}
          <Link
            href="/manager/kitchen"
            className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs hover:border-[#b8894b] transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Kitchen Portal
                </p>
                <FileText size={14} className="text-[#b8894b]" />
              </div>
              <p className="mt-1 text-sm font-black text-stone-900 group-hover:text-[#b8894b] transition">
                Purchase Requests
              </p>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#b8894b]">
              <span>Manage shortages</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Reusable Assets */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Rentable Assets
            </p>
            <p className="mt-1 text-2xl font-black text-gray-900">{items.length}</p>
            <p className="mt-1 text-[11px] text-gray-500">Furniture, crockery & gear</p>
          </div>

          {/* Available for Hire */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Available for Events
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-700">
              {totalUnits.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-emerald-700 font-medium">In warehouse ready for hire</p>
          </div>

          {/* Active Event Rentals */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
              In Use / At Events
            </p>
            <p className="mt-1 text-2xl font-black text-blue-700">
              {summary?.activeAllocationsCount ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-blue-700 font-medium">Currently dispatched</p>
          </div>

          {/* Equipment Low Stock Alerts */}
          <div
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`rounded-2xl border p-4 shadow-xs cursor-pointer transition ${
              lowStockFilter
                ? "border-rose-400 bg-rose-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
              Low Stock Alerts
            </p>
            <p className="mt-1 text-2xl font-black text-rose-700">{shortagesCount}</p>
            <p className="mt-1 text-[11px] text-rose-600 font-medium">
              {lowStockFilter ? "Showing low stock only" : "Click to filter low stock"}
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === "kitchen"
                ? "Search ingredients by name or pantry location..."
                : "Search rentable equipment by name or storage bay..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 bg-[#fdfcfb] pl-9 pr-4 text-xs font-medium outline-none focus:border-[#9a6c37]"
          />
        </div>

        {/* Tab-Specific Category Dropdown & Filter Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:border-[#9a6c37]"
          >
            <option value="ALL">
              {activeTab === "kitchen" ? "All Kitchen Categories" : "All Equipment Categories"}
            </option>
            {tabCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {lowStockFilter && (
            <button
              type="button"
              onClick={() => setLowStockFilter(false)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
            >
              <span>{activeTab === "kitchen" ? "Shortages Only" : "Low Stock Only"}</span>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Inventory Display: Mobile Cards + Desktop Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={24} className="animate-spin text-[#9a6c37]" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
          <Package size={36} className="mx-auto text-gray-300" />
          <p className="mt-2 text-sm font-bold text-gray-900">
            {activeTab === "kitchen" ? "No kitchen items found" : "No rentable assets found"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {activeTab === "kitchen"
              ? "Add culinary raw ingredients or kitchen consumables using \"New Kitchen Item\"."
              : "Catalog reusable event furniture, tableware, or gear using \"New Rentable Asset\"."}
          </p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* MOBILE CARDS VIEW (md:hidden) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:hidden">
            {items.map((item) => {
              const isLow = item.availableQuantity <= (item.minStockLevel || 10);
              const isKitchenItem =
                item.stockType === "kitchen" ||
                item.category === "Raw Ingredients" ||
                item.category === "Kitchen Supplies";

              return (
                <div
                  key={`mobile-${item._id}`}
                  className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs space-y-3 transition hover:border-[#9a6c37]/40"
                >
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/manager/stock/${item._id}`}
                        className="font-extrabold text-[#29241f] text-sm sm:text-base leading-snug hover:text-[#9a6c37] transition-colors block"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 font-bold text-stone-700">
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <MapPin size={11} />
                          <span>{item.location || "Pantry / Warehouse"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 text-right">
                      {isKitchenItem ? (
                        <span className="inline-flex items-center rounded-lg bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          Kitchen Use Only
                        </span>
                      ) : item.isRentable === true ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px]">
                            ₹{item.rentalPrice || 0}/{item.unit || "unit"}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 mt-0.5">For Rent</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                          Internal Only
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantities & Inventory Grid */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#faf8f5] p-2.5 text-xs">
                    <div className="rounded-lg bg-white p-2 border border-gray-100 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Available</p>
                      <p className="mt-0.5 font-black text-gray-900 text-sm">
                        {item.availableQuantity} <span className="text-[10px] font-medium text-gray-500">{item.unit}</span>
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-2 border border-gray-100 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {isKitchenItem ? "Minimum" : "Reserved"}
                      </p>
                      <p className="mt-0.5 font-bold text-gray-700 text-sm">
                        {isKitchenItem ? item.minStockLevel || 10 : item.reservedQuantity || 0}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-2 border border-gray-100 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {isKitchenItem ? "Cost Value" : "In-Use"}
                      </p>
                      <p className="mt-0.5 font-bold text-gray-700 text-sm">
                        {isKitchenItem ? `₹${item.unitPrice || 0}` : item.inUseQuantity || 0}
                      </p>
                    </div>
                  </div>

                  {/* Footer Alerts & Link */}
                  <div className="flex items-center justify-between pt-1">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                        <AlertTriangle size={12} />
                        <span>{isKitchenItem ? "Ingredient Shortage" : "Low Stock Alert"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 size={12} />
                        <span>Healthy Stock</span>
                      </span>
                    )}

                    <Link
                      href={`/manager/stock/${item._id}`}
                      className="text-xs font-bold text-[#9a6c37] hover:underline flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* DESKTOP TABLE VIEW (hidden md:block) */}
          {/* ========================================================================= */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#faf8f5] text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-4">Item Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Available Stock</th>
                  <th className="py-3.5 px-4 text-center">
                    {activeTab === "kitchen" ? "Min Threshold" : "Reserved / In-Use"}
                  </th>
                  <th className="py-3.5 px-4 text-center">
                    {activeTab === "kitchen" ? "Unit Cost" : "Rental Rate"}
                  </th>
                  <th className="py-3.5 px-4 text-center">Usage Scope</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const isLow = item.availableQuantity <= (item.minStockLevel || 10);
                  const isKitchenItem =
                    item.stockType === "kitchen" ||
                    item.category === "Raw Ingredients" ||
                    item.category === "Kitchen Supplies";

                  return (
                    <tr
                      key={`desktop-${item._id}`}
                      className="hover:bg-[#fdfcfb] transition-colors"
                    >
                      {/* Name & Location */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/manager/stock/${item._id}`}
                          className="font-extrabold text-[#29241f] text-sm hover:text-[#9a6c37] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                          <MapPin size={11} />
                          <span>{item.location || "Central Storage"}</span>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 font-bold text-stone-700">
                          {item.category}
                        </span>
                      </td>

                      {/* Available Quantity */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`text-sm font-black ${
                              isLow ? "text-rose-600" : "text-gray-900"
                            }`}
                          >
                            {item.availableQuantity}{" "}
                            <span className="text-[10px] font-medium text-gray-500">
                              {item.unit || "unit"}
                            </span>
                          </span>
                          {isLow && (
                            <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5">
                              <AlertTriangle size={10} /> Shortage
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Threshold or Reserved/In-Use */}
                      <td className="py-3.5 px-4 text-center">
                        {isKitchenItem ? (
                          <span className="font-semibold text-gray-600">
                            Min {item.minStockLevel || 10} {item.unit}
                          </span>
                        ) : (
                          <div className="inline-flex flex-col items-center text-[11px] font-medium text-gray-600">
                            <span>Reserved: {item.reservedQuantity || 0}</span>
                            <span className="text-gray-400">In-Use: {item.inUseQuantity || 0}</span>
                          </div>
                        )}
                      </td>

                      {/* Cost or Rental Rate */}
                      <td className="py-3.5 px-4 text-center">
                        {isKitchenItem ? (
                          <span className="font-bold text-gray-700">
                            ₹{item.unitPrice || 0} <span className="text-[10px] text-gray-400">/{item.unit}</span>
                          </span>
                        ) : item.isRentable === true ? (
                          <span className="font-black text-emerald-700">
                            ₹{item.rentalPrice || 0} <span className="text-[10px] text-gray-500">/{item.unit}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium">N/A</span>
                        )}
                      </td>

                      {/* Scope Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isKitchenItem ? (
                          <span className="inline-flex items-center rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                            Kitchen Use Only
                          </span>
                        ) : item.isRentable === true ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                            <BadgeCheck size={12} className="text-emerald-600" />
                            Client Rentable
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-lg bg-gray-100 border border-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-500">
                            Internal Equipment
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/manager/stock/${item._id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-[#9a6c37] hover:bg-[#faf8f5] transition shadow-2xs"
                        >
                          <span>Manage</span>
                          <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* SECTION-AWARE CREATE STOCK ITEM MODAL */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-[#e8e1d8] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#29241f]">
                  {activeTab === "kitchen"
                    ? "Add Kitchen Stock / Ingredient"
                    : "Add Reusable Rental Equipment"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeTab === "kitchen"
                    ? "Kitchen stock is for internal culinary use only and cannot be rented."
                    : "Catalog reusable event assets eligible for client hire."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeTab === "kitchen"
                      ? "e.g. Basmati Rice (Long Grain), Pure Ghee"
                      : "e.g. Gold Chiavari Chair, Round Banquet Table"
                  }
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => {
                      const cat = e.target.value as StockCategory;
                      const isKitchenCat =
                        cat === "Raw Ingredients" || cat === "Kitchen Supplies";
                      setNewItem({
                        ...newItem,
                        category: cat,
                        stockType: isKitchenCat ? "kitchen" : "rentable",
                        isRentable: isKitchenCat ? false : newItem.isRentable,
                        rentalPrice: isKitchenCat ? 0 : newItem.rentalPrice,
                      });
                    }}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-bold text-gray-700 outline-none focus:border-[#9a6c37]"
                  >
                    {tabCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700">Unit of Measurement</label>
                  <input
                    type="text"
                    placeholder={activeTab === "kitchen" ? "kg, liters, packets" : "pcs, sets"}
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Initial Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItem.totalQuantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, totalQuantity: Number(e.target.value) })
                    }
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-bold outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">Min Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.minStockLevel}
                    onChange={(e) =>
                      setNewItem({ ...newItem, minStockLevel: Number(e.target.value) })
                    }
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.unitPrice}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unitPrice: Number(e.target.value) })
                    }
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              {/* Rental Controls: Only visible for Rentable Equipment */}
              {activeTab === "kitchen" ||
              newItem.category === "Raw Ingredients" ||
              newItem.category === "Kitchen Supplies" ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <p className="font-bold">Internal Kitchen Item (Non-Rentable)</p>
                  <p className="mt-0.5 text-[11px] text-amber-700 leading-relaxed">
                    Culinary ingredients and kitchen consumables are reserved exclusively for meal preparation and internal kitchen operations. They cannot be rented out.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                  <div>
                    <label className="font-bold text-gray-700">
                      Client Rental Rate (₹ per {newItem.unit || "unit"})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.rentalPrice}
                      onChange={(e) =>
                        setNewItem({ ...newItem, rentalPrice: Number(e.target.value) })
                      }
                      className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-bold text-emerald-800 outline-none focus:border-emerald-600"
                      placeholder="e.g. 150"
                    />
                    <p className="mt-1 text-[10px] text-gray-400">
                      Charged per unit when rented for events
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1 sm:pt-4">
                    <input
                      type="checkbox"
                      id="isRentableCreate"
                      checked={newItem.isRentable}
                      onChange={(e) =>
                        setNewItem({ ...newItem, isRentable: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label
                      htmlFor="isRentableCreate"
                      className="text-xs font-bold text-gray-700 cursor-pointer"
                    >
                      Available for Client Rental
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700">Storage Location</label>
                <input
                  type="text"
                  placeholder={
                    activeTab === "kitchen"
                      ? "Cold Storage / Dry Pantry Rack B"
                      : "Central Warehouse - Bay 4"
                  }
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Description / Specs</label>
                <textarea
                  rows={2}
                  placeholder={
                    activeTab === "kitchen"
                      ? "Optional grade, brand, or preparation notes"
                      : "Optional material specifications, color, or rental guidelines"
                  }
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={createSubmitting}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="rounded-xl bg-[#29241f] px-5 py-2 text-xs font-extrabold text-white hover:bg-black cursor-pointer flex items-center gap-2"
                >
                  {createSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>
                    {activeTab === "kitchen" ? "Create Kitchen Item" : "Create Rentable Item"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

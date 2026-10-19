"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  PackagePlus,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  Loader2,
  MapPin,
  X,
  Eye,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Crockery" as StockCategory,
    totalQuantity: 50,
    minStockLevel: 10,
    unit: "pcs",
    unitPrice: 0,
    rentalPrice: 0,
    isRentable: true,
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

      const [itemsRes, summaryRes] = await Promise.all([
        getStockItems(token, {
          search,
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
  }, [token, search, categoryFilter, lowStockFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handle Create Stock Item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setCreateSubmitting(true);
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
        rentalPrice: 0,
        isRentable: true,
        location: "Central Warehouse",
        description: "",
      });
      void loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create item");
    } finally {
      setCreateSubmitting(false);
    }
  };

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
            Stock & Equipment Management
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Master inventory catalog, active event rentals, and equipment availability tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#29241f] px-4 text-xs font-extrabold text-white shadow-xs hover:bg-black transition active:scale-95 cursor-pointer"
        >
          <PackagePlus size={16} />
          <span>New Stock Item</span>
        </button>
      </div>

      {/* Top KPI Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Stock Items */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Items</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{summary?.totalItems ?? items.length}</p>
          <p className="mt-1 text-[11px] text-gray-500">Catalogued products</p>
        </div>

        {/* Available Units */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Available Units</p>
          <p className="mt-1 text-2xl font-black text-emerald-700">
            {items.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium">Ready for allocation</p>
        </div>

        {/* Active Rentals / Allocations */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800">In Use / Events</p>
          <p className="mt-1 text-2xl font-black text-blue-700">
            {summary?.activeAllocationsCount ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-blue-700 font-medium">Active event rentals</p>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`rounded-2xl border p-4 shadow-xs cursor-pointer transition ${
            lowStockFilter
              ? "border-rose-400 bg-rose-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Low Stock Alerts</p>
          <p className="mt-1 text-2xl font-black text-rose-700">{summary?.lowStockCount ?? 0}</p>
          <p className="mt-1 text-[11px] text-rose-600 font-medium">
            {lowStockFilter ? "Showing low stock only" : "Click to filter low stock"}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stock by item name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 bg-[#fdfcfb] pl-9 pr-4 text-xs font-medium outline-none focus:border-[#9a6c37]"
          />
        </div>

        {/* Category Dropdown & Low Stock Toggle */}
        <div className="flex items-center gap-2">
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

          {lowStockFilter && (
            <button
              type="button"
              onClick={() => setLowStockFilter(false)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
            >
              <span>Low Stock Only</span>
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
          <p className="mt-2 text-sm font-bold text-gray-900">No stock items found</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Create a new item using "+ New Stock Item" or adjust your search filter.
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
                          <span>{item.location || "Warehouse"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Rental Status Badge */}
                    <div className="shrink-0 text-right">
                      {item.isRentable !== false ? (
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
                    {/* Available Quantity */}
                    <div className="rounded-lg bg-white p-2 border border-gray-100 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Available</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`text-base font-black ${
                            isLow ? "text-rose-700" : "text-emerald-700"
                          }`}
                        >
                          {item.availableQuantity}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500">{item.unit}</span>
                      </div>
                      {isLow && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.2">
                          <AlertTriangle size={9} /> Low Stock
                        </span>
                      )}
                    </div>

                    {/* In Use Quantity (unified) */}
                    <div className="rounded-lg bg-white p-2 border border-gray-100 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">In Use</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-black text-blue-800">
                          {(item.inUseQuantity || 0) + (item.reservedQuantity || 0)}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500">{item.unit}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">At events</p>
                    </div>

                    {/* Total Quantity */}
                    <div className="rounded-lg bg-white p-2 border border-gray-100 shadow-2xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Stock</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-black text-gray-900">{item.totalQuantity}</span>
                        <span className="text-[11px] font-semibold text-gray-500">{item.unit}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Min: {item.minStockLevel || 10}</p>
                    </div>
                  </div>

                  {/* Actions Row: ONLY View Button Outside (No Edit, No Restock, No Delete) */}
                  <div className="pt-1">
                    <Link
                      href={`/manager/stock/${item._id}`}
                      className="w-full min-h-10 rounded-xl bg-[#29241f] px-4 text-xs font-bold text-white hover:bg-black transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye size={15} />
                      <span>View Details & Allocations</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* DESKTOP TABLE VIEW (hidden md:block) */}
          {/* ========================================================================= */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#e8e1d8] bg-[#faf8f5] text-[11px] font-bold uppercase tracking-wider text-[#29241f]">
                  <tr>
                    <th className="px-4 py-3.5">Product Name & Category</th>
                    <th className="px-4 py-3.5 text-center">Available</th>
                    <th className="px-4 py-3.5 text-center">In Use</th>
                    <th className="px-4 py-3.5 text-center">Total Stock</th>
                    <th className="px-4 py-3.5 text-center">Rental Policy</th>
                    <th className="px-4 py-3.5 text-center">Damaged / Lost</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece6]">
                  {items.map((item) => {
                    const isLow = item.availableQuantity <= (item.minStockLevel || 10);
                    return (
                      <tr key={item._id} className="hover:bg-[#fcfaf7] transition">
                        {/* Name & Location */}
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/manager/stock/${item._id}`}
                            className="font-bold text-[#29241f] text-sm hover:text-[#9a6c37] transition-colors block"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                            <span className="font-bold text-stone-700 bg-stone-100 rounded px-1.5 py-0.2">
                              {item.category}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <MapPin size={11} />
                              {item.location || "Warehouse"}
                            </span>
                          </div>
                        </td>

                        {/* Available */}
                        <td className="px-4 py-3.5 text-center font-black">
                          <span className={`text-sm ${isLow ? "text-rose-700" : "text-emerald-700"}`}>
                            {item.availableQuantity}
                          </span>{" "}
                          <span className="text-[11px] font-medium text-gray-400">{item.unit}</span>
                          {isLow && (
                            <div className="mt-0.5">
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-200 rounded px-1">
                                Low
                              </span>
                            </div>
                          )}
                        </td>

                        {/* In Use (combines in-use and reserved) */}
                        <td className="px-4 py-3.5 text-center font-bold text-blue-700">
                          {(item.inUseQuantity || 0) + (item.reservedQuantity || 0)} {item.unit}
                        </td>

                        {/* Total Stock */}
                        <td className="px-4 py-3.5 text-center font-bold text-gray-900">
                          {item.totalQuantity} <span className="text-[11px] font-medium text-gray-400">{item.unit}</span>
                          <div className="text-[10px] text-gray-400 font-normal">Min: {item.minStockLevel || 10}</div>
                        </td>

                        {/* Rental Rate */}
                        <td className="px-4 py-3.5 text-center">
                          {item.isRentable !== false ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px]">
                                ₹{item.rentalPrice || 0}/{item.unit || "unit"}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-600 mt-0.5">Rentable</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center rounded-lg bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                              Internal Only
                            </span>
                          )}
                        </td>

                        {/* Damaged / Lost */}
                        <td className="px-4 py-3.5 text-center text-[11px]">
                          <span className="text-amber-700 font-bold">{item.damagedQuantity || 0} dmg</span>
                          <span className="text-gray-300 mx-1">/</span>
                          <span className="text-rose-700 font-bold">{item.lostQuantity || 0} lost</span>
                        </td>

                        {/* Action: ONLY View Button Outside (No Edit, No Restock, No Delete) */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <Link
                            href={`/manager/stock/${item._id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#9a6c37] transition shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE MASTER STOCK ITEM */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#29241f]">Create Master Stock Item</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner Plate, Wine Glass, Banquet Table, Induction Cooktop"
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
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as StockCategory })}
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
                    placeholder="pcs, sets, boxes"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Total Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItem.totalQuantity}
                    onChange={(e) => setNewItem({ ...newItem, totalQuantity: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-bold outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">Min Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.minStockLevel}
                    onChange={(e) => setNewItem({ ...newItem, minStockLevel: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Rental Rate (₹ per {newItem.unit || "unit"})</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.rentalPrice}
                    onChange={(e) => setNewItem({ ...newItem, rentalPrice: Number(e.target.value) })}
                    className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-bold text-emerald-800 outline-none focus:border-emerald-600"
                    placeholder="e.g. 150"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">Charged per unit when rented for events</p>
                </div>

                <div className="flex items-center gap-2 pt-1 sm:pt-4">
                  <input
                    type="checkbox"
                    id="isRentableCreate"
                    checked={newItem.isRentable}
                    onChange={(e) => setNewItem({ ...newItem, isRentable: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="isRentableCreate" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Available for Client Rental
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700">Storage Location</label>
                <input
                  type="text"
                  placeholder="Warehouse A - Shelf 3"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs font-medium outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Description / Specs</label>
                <textarea
                  rows={2}
                  placeholder="Optional details or specifications for rental"
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
                  <span>Create Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

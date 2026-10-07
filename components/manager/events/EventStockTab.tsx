"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Package,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  RefreshCw,
  Clock,
  ShieldCheck,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  AlertCircle,
  Check,
  Search,
  Trash2,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import {
  getEventStock,
  addStockToEvent,
  reserveEventStock,
  assignStaffToStock,
  verifyStockReturn,
  reportStockDiscrepancy,
  removeEventStockRequirement,
  getStockItems,
} from "@/lib/stock.api";
import type { EventStock, StockItem, EventStockStatus } from "@/types/stock";
import { getStaff } from "@/lib/staff.api";
import { useAuth } from "@/hooks/useAuth";

interface EventStockTabProps {
  eventId: string;
  eventName: string;
  token?: string;
}

export default function EventStockTab({ eventId, eventName, token: propToken }: EventStockTabProps) {
  const { token: authToken } = useAuth();
  const token = propToken || authToken || "";

  // Data states
  const [eventStocks, setEventStocks] = useState<EventStock[]>([]);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [stockCatalog, setStockCatalog] = useState<StockItem[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tab filter: 'all' | 'pending' | 'in_custody' | 'verified'
  const [activeQueueTab, setActiveQueueTab] = useState<"all" | "pending" | "in_custody" | "verified">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isConfirmVerifyOpen, setIsConfirmVerifyOpen] = useState(false);
  const [isDiscrepancyOpen, setIsDiscrepancyOpen] = useState(false);

  // Active item for modal actions
  const [selectedStock, setSelectedStock] = useState<EventStock | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    stockItemId: "",
    requiredQuantity: 1,
    autoReserve: true,
    notes: "",
  });

  const [assignForm, setAssignForm] = useState({
    staffId: "",
    expectedReturnAt: "",
    notes: "",
  });

  const [verifyForm, setVerifyForm] = useState({
    approvedReturnedQuantity: 0,
    approvedDamagedQuantity: 0,
    approvedLostQuantity: 0,
    managerNotes: "",
  });

  const [discrepancyForm, setDiscrepancyForm] = useState({
    notes: "",
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setError(null);
      const [stocksRes, catalogRes, staffRes] = await Promise.all([
        getEventStock(eventId, token),
        getStockItems({ limit: 100 }, token),
        token ? getStaff(token, { status: "active", limit: 100 }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      if (stocksRes.data) {
        setEventStocks(stocksRes.data);
      }
      if (stocksRes.event) {
        setEventDetails(stocksRes.event);
      }
      if (catalogRes.data) {
        setStockCatalog(catalogRes.data);
      }
      if (staffRes && "data" in staffRes && Array.isArray((staffRes as any).data)) {
        setStaffList((staffRes as any).data);
      } else if (staffRes && "staff" in staffRes && Array.isArray((staffRes as any).staff)) {
        setStaffList((staffRes as any).staff);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load event stock data");
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived metrics
  const now = new Date();
  const totalRequired = useMemo(() => eventStocks.reduce((sum, s) => sum + (s.requiredQuantity || 0), 0), [eventStocks]);
  const totalTaken = useMemo(() => eventStocks.reduce((sum, s) => sum + (s.takenQuantity || 0), 0), [eventStocks]);
  const totalReturned = useMemo(() => eventStocks.reduce((sum, s) => sum + (s.approvedReturnedQuantity ?? s.returnedQuantity ?? 0), 0), [eventStocks]);
  const totalDamaged = useMemo(() => eventStocks.reduce((sum, s) => sum + (s.approvedDamagedQuantity ?? s.damagedQuantity ?? 0), 0), [eventStocks]);
  const totalLost = useMemo(() => eventStocks.reduce((sum, s) => sum + (s.approvedLostQuantity ?? s.lostQuantity ?? 0), 0), [eventStocks]);

  const pendingReturns = useMemo(
    () => eventStocks.filter((s) => s.status === "RETURN_PENDING" || s.status === "RETURNED"),
    [eventStocks]
  );
  const inCustodyStocks = useMemo(
    () => eventStocks.filter((s) => s.status === "TAKEN_BY_STAFF" || s.status === "AT_EVENT"),
    [eventStocks]
  );
  const verifiedStocks = useMemo(
    () => eventStocks.filter((s) => s.status === "VERIFIED" || s.status === "CLOSED"),
    [eventStocks]
  );
  const overdueReturns = useMemo(
    () =>
      eventStocks.filter((s) => {
        if (!s.expectedReturnAt) return false;
        if (s.status === "VERIFIED" || s.status === "CLOSED") return false;
        return new Date(s.expectedReturnAt) < now;
      }),
    [eventStocks, now]
  );

  // Filtered list based on queue tab and search query
  const filteredStocks = useMemo(() => {
    let list = eventStocks;
    if (activeQueueTab === "pending") {
      list = pendingReturns;
    } else if (activeQueueTab === "in_custody") {
      list = inCustodyStocks;
    } else if (activeQueueTab === "verified") {
      list = verifiedStocks;
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((stock) => {
      const item = (stock.stockItemId || stock.stockItem) as StockItem;
      const itemName = item?.name?.toLowerCase() || "";
      const itemCategory = item?.category?.toLowerCase() || "";
      const itemSku = item?.sku?.toLowerCase() || "";
      const staffName = stock.assignedStaff?.name?.toLowerCase() || "";
      return (
        itemName.includes(q) ||
        itemCategory.includes(q) ||
        itemSku.includes(q) ||
        staffName.includes(q)
      );
    });
  }, [eventStocks, activeQueueTab, pendingReturns, inCustodyStocks, verifiedStocks, searchQuery]);

  // Handle Add Item to Event
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(addForm.requiredQuantity);
    if (!addForm.stockItemId || qty <= 0 || !Number.isInteger(qty)) {
      setError("Please select an item and provide a valid whole integer quantity.");
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      await addStockToEvent(eventId, {
        stockItemId: addForm.stockItemId,
        requiredQuantity: qty,
        autoReserve: addForm.autoReserve,
        notes: addForm.notes,
      });
      setSuccessMsg("Stock requirement added to event successfully.");
      setIsAddOpen(false);
      setAddForm({ stockItemId: "", requiredQuantity: 1, autoReserve: true, notes: "" });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to add stock item.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Auto-Reserve Stock
  const handleReserve = async (itemIds?: string[]) => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await reserveEventStock(eventId, itemIds);
      if (res.success) {
        setSuccessMsg(res.message || "Stock reserved successfully.");
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to reserve stock.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Assign Staff & Scheduled Return
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !assignForm.staffId) {
      setError("Please select a staff member to take custody.");
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      await assignStaffToStock(selectedStock._id, {
        staffId: assignForm.staffId,
        expectedReturnAt: assignForm.expectedReturnAt ? new Date(assignForm.expectedReturnAt).toISOString() : undefined,
        notes: assignForm.notes,
      });
      setSuccessMsg("Staff member assigned to stock with scheduled recollection time.");
      setIsAssignOpen(false);
      setSelectedStock(null);
      setAssignForm({ staffId: "", expectedReturnAt: "", notes: "" });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to assign staff.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Verify Modal
  const openVerifyModal = (stock: EventStock) => {
    setSelectedStock(stock);
    setVerifyForm({
      approvedReturnedQuantity: stock.returnedQuantity || 0,
      approvedDamagedQuantity: stock.damagedQuantity || 0,
      approvedLostQuantity: stock.lostQuantity || 0,
      managerNotes: "",
    });
    setIsVerifyOpen(true);
    setIsConfirmVerifyOpen(false);
    setError(null);
  };

  // Live reconciliation calculation inside verify modal
  const verifyTaken = selectedStock?.takenQuantity || 0;
  const verifyApprovedTotal =
    Number(verifyForm.approvedReturnedQuantity || 0) +
    Number(verifyForm.approvedDamagedQuantity || 0) +
    Number(verifyForm.approvedLostQuantity || 0);
  const isVerifyReconciled = verifyApprovedTotal === verifyTaken && verifyTaken > 0;
  const verifyDiff = verifyTaken - verifyApprovedTotal;

  // Handle Verify Return & Approve
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;

    if (!isVerifyReconciled) {
      setError(
        `Reconciliation mismatch: Sum of approved good (${verifyForm.approvedReturnedQuantity}), damaged (${verifyForm.approvedDamagedQuantity}), and lost (${verifyForm.approvedLostQuantity}) items equals ${verifyApprovedTotal}, which does not match taken quantity (${verifyTaken}).`
      );
      return;
    }

    // Move to confirmation step
    setIsConfirmVerifyOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedStock) return;
    try {
      setActionLoading(true);
      setError(null);
      await verifyStockReturn(selectedStock._id, {
        approvedReturnedQuantity: Number(verifyForm.approvedReturnedQuantity) || 0,
        approvedDamagedQuantity: Number(verifyForm.approvedDamagedQuantity) || 0,
        approvedLostQuantity: Number(verifyForm.approvedLostQuantity) || 0,
        managerNotes: verifyForm.managerNotes,
      });
      setSuccessMsg(`Successfully verified return of ${selectedStock.stockItemId?.name || "stock item"} and updated warehouse master inventory.`);
      setIsConfirmVerifyOpen(false);
      setIsVerifyOpen(false);
      setSelectedStock(null);
      setVerifyForm({ approvedReturnedQuantity: 0, approvedDamagedQuantity: 0, approvedLostQuantity: 0, managerNotes: "" });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to verify return.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Discrepancy
  const handleDiscrepancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !discrepancyForm.notes.trim()) {
      setError("Please provide an explanation note regarding the discrepancy.");
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      await reportStockDiscrepancy(selectedStock._id, {
        notes: discrepancyForm.notes,
      });
      setSuccessMsg("Stock discrepancy reported and flagged for review.");
      setIsDiscrepancyOpen(false);
      setSelectedStock(null);
      setDiscrepancyForm({ notes: "" });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to report discrepancy.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Remove Requirement
  const handleRemoveRequirement = async (stock: EventStock) => {
    if (!window.confirm(`Are you sure you want to remove ${stock.stockItemId?.name || "this item"} from the event?`)) {
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      await removeEventStockRequirement(stock._id);
      setSuccessMsg("Stock requirement removed from event.");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to remove requirement.");
    } finally {
      setActionLoading(false);
    }
  };

  // Status Badge Renderer
  const getStatusBadge = (status: EventStockStatus) => {
    switch (status) {
      case "PLANNED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Planned</span>;
      case "RESERVED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Reserved</span>;
      case "READY_FOR_COLLECTION":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Ready to Collect</span>;
      case "TAKEN_BY_STAFF":
      case "AT_EVENT":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">In Custody</span>;
      case "RETURN_PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 animate-pulse border border-purple-200">
            <Clock size={11} /> Return Pending
          </span>
        );
      case "RETURNED":
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck size={11} /> Verified &amp; Restocked
          </span>
        );
      case "DISCREPANCY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle size={11} /> Discrepancy
          </span>
        );
      case "CLOSED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">Closed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Details & Stock Banner */}
      <div className="rounded-3xl border border-[#e8e1d8] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f7f3ee] text-[#9a6c37] shadow-inner">
              <Package size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#252525]">Stock &amp; Equipment Management</h2>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-800 tracking-wide">
                  Live Operations
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                Manage inventory reservation, staff collection, scheduled recollection, returns, and inspection for{" "}
                <span className="font-semibold text-gray-800">{eventName}</span>.
              </p>

              {eventDetails && (
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  {eventDetails.eventDate && (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                      <Calendar size={12} className="text-gray-400" />
                      <span>{new Date(eventDetails.eventDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  )}
                  {eventDetails.location && (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                      <MapPin size={12} className="text-gray-400" />
                      <span>{eventDetails.location}</span>
                    </div>
                  )}
                  {eventDetails.client?.name && (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                      <User size={12} className="text-gray-400" />
                      <span>Client: {eventDetails.client.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchData}
              disabled={loading || actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => handleReserve()}
              disabled={actionLoading || eventStocks.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition disabled:opacity-50"
              title="Automatically reserve unreserved required quantities from warehouse"
            >
              <Layers size={14} />
              Auto-Reserve All
            </button>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9a6c37] hover:bg-[#855c2d] rounded-xl shadow-xs transition"
            >
              <Plus size={14} />
              Add Stock Item
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-3.5">
            <div className="text-[11px] font-bold uppercase text-gray-500">Total Required</div>
            <div className="mt-1 text-xl font-extrabold text-gray-900">{totalRequired}</div>
            <div className="text-[10px] text-gray-400">{eventStocks.length} allocated items</div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-3.5">
            <div className="text-[11px] font-bold uppercase text-blue-700">In Custody</div>
            <div className="mt-1 text-xl font-extrabold text-blue-900">{totalTaken}</div>
            <div className="text-[10px] text-blue-600">{inCustodyStocks.length} active handovers</div>
          </div>

          <div
            onClick={() => setActiveQueueTab("pending")}
            className={`rounded-2xl border p-3.5 cursor-pointer transition ${
              pendingReturns.length > 0
                ? "border-purple-300 bg-purple-50/60 shadow-2xs hover:bg-purple-100/60"
                : "border-gray-200 bg-gray-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase text-purple-700">Pending Review</div>
              {pendingReturns.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-purple-600 animate-ping" />
              )}
            </div>
            <div className="mt-1 text-xl font-extrabold text-purple-900">{pendingReturns.length}</div>
            <div className="text-[10px] text-purple-600">Awaiting return inspection</div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3.5">
            <div className="text-[11px] font-bold uppercase text-emerald-700">Approved Good</div>
            <div className="mt-1 text-xl font-extrabold text-emerald-900">{totalReturned}</div>
            <div className="text-[10px] text-emerald-600">Restocked to warehouse</div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-3.5">
            <div className="text-[11px] font-bold uppercase text-amber-700">Damaged Items</div>
            <div className="mt-1 text-xl font-extrabold text-amber-900">{totalDamaged}</div>
            <div className="text-[10px] text-amber-600">Logged in quarantine</div>
          </div>

          <div
            className={`rounded-2xl border p-3.5 ${
              overdueReturns.length > 0
                ? "border-red-300 bg-red-50/50"
                : "border-gray-200 bg-gray-50/50"
            }`}
          >
            <div className="text-[11px] font-bold uppercase text-red-700">Overdue / Lost</div>
            <div className="mt-1 text-xl font-extrabold text-red-900">
              {totalLost} <span className="text-xs font-medium text-gray-500">lost</span>
            </div>
            <div className="text-[10px] text-red-600 font-medium">
              {overdueReturns.length > 0 ? `${overdueReturns.length} overdue returns` : "No overdue items"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stock Table & Queue Section */}
      <div className="rounded-3xl border border-[#e8e1d8] bg-white p-5 sm:p-6 shadow-xs">
        {/* Navigation Tabs & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveQueueTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeQueueTab === "all"
                  ? "bg-[#252525] text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Requirements ({eventStocks.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveQueueTab("pending")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                activeQueueTab === "pending"
                  ? "bg-purple-700 text-white shadow-2xs"
                  : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
              }`}
            >
              <ShieldCheck size={13} />
              Pending Inspection ({pendingReturns.length})
              {pendingReturns.length > 0 && <span className="h-2 w-2 rounded-full bg-purple-400" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveQueueTab("in_custody")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeQueueTab === "in_custody"
                  ? "bg-blue-700 text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              In Custody ({inCustodyStocks.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveQueueTab("verified")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeQueueTab === "verified"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Verified &amp; Restocked ({verifiedStocks.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, SKU, or staff..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:border-[#9a6c37] focus:outline-none"
            />
          </div>
        </div>

        {/* Content Table / Cards */}
        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <RefreshCw size={28} className="animate-spin text-[#9a6c37]" />
              <span className="mt-3 text-xs font-semibold text-gray-600">Loading stock data and verification queues...</span>
            </div>
          ) : filteredStocks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <Package size={40} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm font-bold text-gray-700">
                {searchQuery ? "No matching stock items found" : "No items in this queue"}
              </p>
              <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
                {searchQuery
                  ? `No items match "${searchQuery}". Try searching with a different keyword.`
                  : activeQueueTab === "pending"
                  ? "All stock returns for this event have been verified and processed."
                  : "Add equipment and inventory requirements to manage this event's stock."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold uppercase text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Item / Category</th>
                    <th className="px-3 py-3 text-center">Required</th>
                    <th className="px-3 py-3 text-center">Reserved</th>
                    <th className="px-3 py-3 text-center">Taken</th>
                    <th className="px-3 py-3 text-center">Good / Dmg / Lost</th>
                    <th className="px-4 py-3">Staff Custody &amp; Return Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredStocks.map((stock) => {
                    const item = (stock.stockItemId || stock.stockItem) as StockItem;
                    const staff = stock.assignedStaff;
                    const isOverdue =
                      stock.expectedReturnAt &&
                      new Date(stock.expectedReturnAt) < now &&
                      stock.status !== "VERIFIED" &&
                      stock.status !== "CLOSED";

                    return (
                      <tr
                        key={stock._id}
                        className={`transition ${
                          stock.status === "RETURN_PENDING"
                            ? "bg-purple-50/20 hover:bg-purple-50/40"
                            : "hover:bg-gray-50/60"
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-[#252525]">{item?.name || "Unknown Item"}</div>
                          <div className="text-[11px] text-gray-400">
                            {item?.category || "Equipment"} {item?.sku && <span>&bull; SKU: {item.sku}</span>}
                          </div>
                        </td>

                        <td className="px-3 py-3.5 text-center font-bold text-gray-900">
                          {stock.requiredQuantity} <span className="text-[10px] font-normal text-gray-400">{item?.unit || "pcs"}</span>
                        </td>

                        <td className="px-3 py-3.5 text-center font-semibold text-amber-700">
                          {stock.reservedQuantity}
                        </td>

                        <td className="px-3 py-3.5 text-center font-semibold text-blue-700">
                          <div>{stock.takenQuantity}</div>
                          {stock.takenAt && (
                            <div className="text-[10px] text-gray-400 font-normal">
                              {new Date(stock.takenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-center text-[11px]">
                          {stock.status === "VERIFIED" ? (
                            <div>
                              <span className="text-emerald-700 font-bold" title="Approved Good Condition">
                                {stock.approvedReturnedQuantity ?? stock.returnedQuantity}
                              </span>{" "}
                              /{" "}
                              <span className="text-amber-700 font-bold" title="Approved Damaged">
                                {stock.approvedDamagedQuantity ?? stock.damagedQuantity}
                              </span>{" "}
                              /{" "}
                              <span className="text-red-700 font-bold" title="Approved Lost">
                                {stock.approvedLostQuantity ?? stock.lostQuantity}
                              </span>
                              <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Approved</div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-emerald-700 font-bold" title="Staff Reported Good">
                                {stock.returnedQuantity}
                              </span>{" "}
                              /{" "}
                              <span className="text-amber-700 font-bold" title="Staff Reported Damaged">
                                {stock.damagedQuantity}
                              </span>{" "}
                              /{" "}
                              <span className="text-red-700 font-bold" title="Staff Reported Lost">
                                {stock.lostQuantity}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {staff ? (
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                                <User size={12} className="text-gray-400" />
                                <span>{staff.name}</span>
                              </div>
                              {staff.phone && (
                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Phone size={10} />
                                  <span>{staff.phone}</span>
                                </div>
                              )}
                              {stock.expectedReturnAt ? (
                                <div
                                  className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md inline-flex ${
                                    isOverdue
                                      ? "bg-red-100 text-red-800 border border-red-200"
                                      : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                  }`}
                                >
                                  <Clock size={11} className={isOverdue ? "text-red-600" : "text-indigo-500"} />
                                  <span>
                                    {isOverdue ? "Overdue: " : "Due: "}
                                    {new Date(stock.expectedReturnAt).toLocaleDateString([], { month: "short", day: "numeric" })},{" "}
                                    {new Date(stock.expectedReturnAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="inline-flex items-center text-gray-400 italic text-[11px]">
                              Not Assigned
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">{getStatusBadge(stock.status)}</td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect & Approve Button for RETURN_PENDING */}
                            {(stock.status === "RETURN_PENDING" || stock.status === "RETURNED") && (
                              <button
                                type="button"
                                onClick={() => openVerifyModal(stock)}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1 rounded-xl bg-purple-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-800 shadow-xs transition disabled:opacity-50"
                                title="Inspect & Approve Return"
                              >
                                <ShieldCheck size={13} />
                                Inspect Return
                              </button>
                            )}

                            {/* Assign / Reschedule Button */}
                            {stock.status !== "VERIFIED" && stock.status !== "CLOSED" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStock(stock);
                                  let formattedDate = "";
                                  if (stock.expectedReturnAt) {
                                    const dt = new Date(stock.expectedReturnAt);
                                    formattedDate = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                  }
                                  setAssignForm({
                                    staffId: stock.assignedStaff?._id || "",
                                    expectedReturnAt: formattedDate,
                                    notes: stock.takeNotes || "",
                                  });
                                  setIsAssignOpen(true);
                                }}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition disabled:opacity-50"
                                title="Assign Staff Member & Return Schedule"
                              >
                                <UserCheck size={12} className="text-indigo-600" />
                                {staff ? "Schedule" : "Assign"}
                              </button>
                            )}

                            {/* Discrepancy Button */}
                            {stock.status === "RETURN_PENDING" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStock(stock);
                                  setIsDiscrepancyOpen(true);
                                }}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1 rounded-xl bg-red-50 border border-red-200 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100 shadow-2xs transition disabled:opacity-50"
                                title="Flag Discrepancy"
                              >
                                <AlertTriangle size={12} />
                                Discrepancy
                              </button>
                            )}

                            {/* Remove Allocation (Only if not taken or completed) */}
                            {stock.status === "PLANNED" || stock.status === "RESERVED" ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveRequirement(stock)}
                                disabled={actionLoading}
                                className="inline-flex items-center p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Remove requirement"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: Add Stock Requirement                              */}
      {/* ========================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-[#252525]">Add Stock Requirement</h3>
            <p className="mt-1 text-xs text-gray-500">
              Select an item from warehouse inventory and specify the required count for this event.
            </p>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Master Inventory Item *</label>
                <select
                  value={addForm.stockItemId}
                  onChange={(e) => setAddForm({ ...addForm, stockItemId: e.target.value })}
                  required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-[#9a6c37] focus:outline-none"
                >
                  <option value="">-- Choose Stock Item --</option>
                  {stockCatalog.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.availableQuantity} {item.unit || "pcs"} available) - Category: {item.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Required Quantity *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={addForm.requiredQuantity === 0 ? "" : addForm.requiredQuantity}
                  placeholder="1"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setAddForm({ ...addForm, requiredQuantity: val === "" ? ("" as any) : Number(val) });
                  }}
                  onFocus={(e) => e.target.select()}
                  required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-[#9a6c37] focus:outline-none font-bold"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoReserve"
                  checked={addForm.autoReserve}
                  onChange={(e) => setAddForm({ ...addForm, autoReserve: e.target.checked })}
                  className="rounded border-gray-300 text-[#9a6c37] focus:ring-[#9a6c37]"
                />
                <label htmlFor="autoReserve" className="text-xs font-medium text-gray-700">
                  Auto-reserve available stock from warehouse immediately
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="e.g. Ensure items are inspected and sanitized prior to packing"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-[#9a6c37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-[#9a6c37] px-4 py-2 text-xs font-semibold text-white hover:bg-[#855c2d] transition disabled:opacity-50"
                >
                  {actionLoading ? "Adding..." : "Add to Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Assign Staff & Schedule Recollection               */}
      {/* ========================================================= */}
      {isAssignOpen && selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-[#252525]">Assign Staff &amp; Recollection Schedule</h3>
            <p className="mt-1 text-xs text-gray-500">
              Assign physical custody for <span className="font-semibold text-gray-800">{selectedStock.stockItemId?.name || selectedStock.stockItem?.name}</span> ({selectedStock.requiredQuantity} units) and set scheduled recollection time.
            </p>

            <form onSubmit={handleAssignSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Custody Staff Member *</label>
                <select
                  value={assignForm.staffId}
                  onChange={(e) => setAssignForm({ ...assignForm, staffId: e.target.value })}
                  required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-[#9a6c37] focus:outline-none font-medium"
                >
                  <option value="">-- Choose Staff Member --</option>
                  {staffList.map((st) => (
                    <option key={st._id || st.id} value={st._id || st.id}>
                      {st.name} ({st.department || "Staff"}) - {st.phone || st.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Scheduled Recollection / Return Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={assignForm.expectedReturnAt}
                  onChange={(e) => setAssignForm({ ...assignForm, expectedReturnAt: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-[#9a6c37] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Target deadline when staff must recollect plates/items and return to storage.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Coordinator Notes</label>
                <textarea
                  rows={2}
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  placeholder="e.g. Ensure all plates are counted and inspected prior to leaving banquet hall"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-[#9a6c37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignOpen(false);
                    setSelectedStock(null);
                  }}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Return Inspection & Approval                       */}
      {/* ========================================================= */}
      {isVerifyOpen && selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#252525]">Stock Return Inspection &amp; Approval</h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Inspect returned items for <span className="font-semibold text-gray-800">{selectedStock.stockItemId?.name || selectedStock.stockItem?.name}</span> by{" "}
                  <span className="font-semibold text-gray-800">{selectedStock.assignedStaff?.name || "Staff"}</span>.
                </p>
              </div>
              <span className="rounded-full bg-purple-100 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 uppercase">
                Awaiting Approval
              </span>
            </div>

            {/* Staff Reported Breakdown Display */}
            <div className="mt-4 rounded-2xl bg-[#faf8f5] p-4 text-xs space-y-3 border border-[#e8e1d8]">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <span>Staff Reported Breakdown</span>
                {selectedStock.returnedAt && (
                  <span className="text-gray-400 font-normal lowercase">
                    submitted {new Date(selectedStock.returnedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl bg-white p-2.5 border border-gray-200">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Taken</div>
                  <div className="font-extrabold text-gray-900 text-sm mt-0.5">{selectedStock.takenQuantity}</div>
                </div>
                <div className="rounded-xl bg-white p-2.5 border border-emerald-100">
                  <div className="text-[10px] text-emerald-600 font-bold uppercase">Good Cond.</div>
                  <div className="font-extrabold text-emerald-700 text-sm mt-0.5">+{selectedStock.returnedQuantity}</div>
                </div>
                <div className="rounded-xl bg-white p-2.5 border border-amber-100">
                  <div className="text-[10px] text-amber-600 font-bold uppercase">Damaged</div>
                  <div className="font-extrabold text-amber-700 text-sm mt-0.5">{selectedStock.damagedQuantity}</div>
                </div>
                <div className="rounded-xl bg-white p-2.5 border border-red-100">
                  <div className="text-[10px] text-red-600 font-bold uppercase">Lost / Missing</div>
                  <div className="font-extrabold text-red-700 text-sm mt-0.5">{selectedStock.lostQuantity}</div>
                </div>
              </div>

              {selectedStock.damagedReason && (
                <div className="text-amber-800 text-[11px] bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <span className="font-bold">Staff Damage Explanation:</span> {selectedStock.damagedReason}
                </div>
              )}
              {selectedStock.lostReason && (
                <div className="text-red-800 text-[11px] bg-red-50 p-2.5 rounded-xl border border-red-200">
                  <span className="font-bold">Staff Loss Explanation:</span> {selectedStock.lostReason}
                </div>
              )}
              {selectedStock.returnNotes && (
                <div className="text-gray-600 text-[11px] bg-white p-2 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-700">Staff Notes:</span> {selectedStock.returnNotes}
                </div>
              )}
            </div>

            {/* Manager Editable Approval Fields */}
            <form onSubmit={handleVerifySubmit} className="mt-5 space-y-4">
              <div className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Manager Verification &amp; Master Restock Counts
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    Approved Good (Restock) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={verifyForm.approvedReturnedQuantity === 0 ? "0" : verifyForm.approvedReturnedQuantity}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setVerifyForm({ ...verifyForm, approvedReturnedQuantity: val === "" ? 0 : Number(val) });
                    }}
                    onFocus={(e) => e.target.select()}
                    required
                    className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-sm font-bold text-emerald-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">
                    Approved Damaged
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={verifyForm.approvedDamagedQuantity === 0 ? "0" : verifyForm.approvedDamagedQuantity}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setVerifyForm({ ...verifyForm, approvedDamagedQuantity: val === "" ? 0 : Number(val) });
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3 py-2 text-sm font-bold text-amber-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-red-800 mb-1">
                    Approved Lost
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={verifyForm.approvedLostQuantity === 0 ? "0" : verifyForm.approvedLostQuantity}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setVerifyForm({ ...verifyForm, approvedLostQuantity: val === "" ? 0 : Number(val) });
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-xl border border-red-300 bg-red-50/40 px-3 py-2 text-sm font-bold text-red-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Live Reconciliation Invariant Feedback Bar */}
              <div
                className={`rounded-xl p-3 text-xs font-semibold flex items-center justify-between border ${
                  isVerifyReconciled
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isVerifyReconciled ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                  )}
                  <span>
                    Approved Sum: <span className="font-extrabold">{verifyApprovedTotal}</span> / Taken:{" "}
                    <span className="font-extrabold">{verifyTaken}</span>
                  </span>
                </div>
                <div>
                  {isVerifyReconciled ? (
                    <span className="text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Reconciled ✓
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-extrabold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-md">
                      {verifyDiff > 0 ? `${verifyDiff} Missing` : `${Math.abs(verifyDiff)} Excess`}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Manager Inspection Remarks &amp; Restock Notes</label>
                <textarea
                  rows={2}
                  value={verifyForm.managerNotes}
                  onChange={(e) => setVerifyForm({ ...verifyForm, managerNotes: e.target.value })}
                  placeholder="e.g. Physically verified on shelf; 15 good plates restocked, 3 damaged plates kept in quarantine."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-[#9a6c37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifyOpen(false);
                    setSelectedStock(null);
                  }}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !isVerifyReconciled}
                  className="rounded-xl bg-purple-700 px-5 py-2 text-xs font-bold text-white hover:bg-purple-800 shadow-xs transition disabled:opacity-40"
                >
                  Review &amp; Approve Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Confirmation Before Final Approval                 */}
      {/* ========================================================= */}
      {isConfirmVerifyOpen && selectedStock && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto">
              <ShieldCheck size={26} />
            </div>

            <h3 className="mt-3 text-center text-base font-bold text-gray-900">
              Confirm Final Stock Approval
            </h3>
            <p className="mt-1 text-center text-xs text-gray-500">
              Are you sure you want to approve this return? This will immediately update the master inventory.
            </p>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-xs space-y-2 border border-gray-200">
              <div className="flex justify-between font-medium text-gray-700">
                <span>Restock to Available Inventory:</span>
                <span className="font-bold text-emerald-700">+{verifyForm.approvedReturnedQuantity} units</span>
              </div>
              <div className="flex justify-between font-medium text-gray-700">
                <span>Log into Damaged Category:</span>
                <span className="font-bold text-amber-700">{verifyForm.approvedDamagedQuantity} units</span>
              </div>
              <div className="flex justify-between font-medium text-gray-700">
                <span>Write-off as Lost / Missing:</span>
                <span className="font-bold text-red-700">{verifyForm.approvedLostQuantity} units</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total Accounted:</span>
                <span>{verifyApprovedTotal} / {verifyTaken} Taken</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmVerifyOpen(false)}
                disabled={actionLoading}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={actionLoading}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Confirm & Restock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Report Discrepancy                                 */}
      {/* ========================================================= */}
      {isDiscrepancyOpen && selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={18} />
              Flag Stock Discrepancy
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Record an issue or discrepancy regarding <span className="font-semibold text-gray-800">{selectedStock.stockItemId?.name || selectedStock.stockItem?.name}</span>.
            </p>

            <form onSubmit={handleDiscrepancySubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Discrepancy Explanation *</label>
                <textarea
                  rows={3}
                  required
                  value={discrepancyForm.notes}
                  onChange={(e) => setDiscrepancyForm({ notes: e.target.value })}
                  placeholder="Explain the specific issue with the returned items or custody..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsDiscrepancyOpen(false);
                    setSelectedStock(null);
                  }}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Submitting..." : "Flag Discrepancy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

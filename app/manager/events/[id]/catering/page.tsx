"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChefHat,
  Clock,
  ExternalLink,
  Info,
  Layers,
  Leaf,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Sparkles,
  Users,
  Utensils,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  BadgeAlert,
  SlidersHorizontal,
  Check,
  X,
  Truck,
  ArrowDownToLine,
  CheckCheck,
} from "lucide-react";

import { getEventById, type Event } from "@/lib/event.api";
import {
  getEventStaffingRequirements,
  calculateKitchenIngredients,
  getKitchenPurchaseRequests,
  reviewKitchenPurchaseRequest,
  receiveKitchenPurchaseRequest,
  type IngredientCalculationResult,
  type EventStaffingResponse,
  type PurchaseRequestRecord,
} from "@/lib/department.api";
import { useAuth } from "@/hooks/useAuth";
import { formatINR } from "@/lib/document-formatter";

export default function EventCateringPage() {
  const router = useRouter();
  const params = useParams();
  const { token, user } = useAuth();

  const eventId = typeof params?.id === "string" ? params.id : "";

  // Main data states
  const [event, setEvent] = useState<Event | null>(null);
  const [staffingData, setStaffingData] = useState<EventStaffingResponse | null>(null);
  const [calcResult, setCalcResult] = useState<IngredientCalculationResult | null>(null);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequestRecord[]>([]);

  // UI & Filter states
  const [loading, setLoading] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [wastagePercent, setWastagePercent] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<"all" | "menu" | "recipe_calc" | "groceries">("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Purchase request review & receive states
  const [reviewModalPr, setReviewModalPr] = useState<PurchaseRequestRecord | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [receiveModalPr, setReceiveModalPr] = useState<PurchaseRequestRecord | null>(null);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number | string>>({});
  const [receiveNotes, setReceiveNotes] = useState("");
  const [receiveSubmitting, setReceiveSubmitting] = useState(false);

  // Fetch all primary event data
  const fetchEventData = useCallback(async () => {
    if (!eventId || !token) return;
    try {
      setLoading(true);
      setError("");

      const [eventRes, staffingRes, calcRes, requestsRes] = await Promise.all([
        getEventById(eventId, token).catch(() => null),
        getEventStaffingRequirements(eventId, token).catch(() => null),
        calculateKitchenIngredients(eventId, wastagePercent, token).catch(() => null),
        getKitchenPurchaseRequests("", token).catch(() => null),
      ]);

      if (eventRes?.data) {
        setEvent(eventRes.data);
      }

      if (staffingRes?.data) {
        setStaffingData(staffingRes.data);
      }

      if (calcRes?.data) {
        setCalcResult(calcRes.data);
      }

      if (Array.isArray(requestsRes?.data)) {
        // Filter purchase requests belonging specifically to this event
        const matched = requestsRes.data.filter((pr: any) => {
          const prEvent = pr.event;
          if (!prEvent) return false;
          if (typeof prEvent === "string") return String(prEvent) === String(eventId);
          if (prEvent._id) return String(prEvent._id) === String(eventId);
          if (prEvent.id) return String(prEvent.id) === String(eventId);
          return false;
        });
        setPurchaseRequests(matched);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load catering and kitchen details.");
    } finally {
      setLoading(false);
    }
  }, [eventId, token, wastagePercent]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  // Recalculate kitchen ingredients when wastage percent changes
  const handleWastageChange = async (newWastage: number) => {
    setWastagePercent(newWastage);
    if (!eventId || !token) return;
    try {
      setCalcLoading(true);
      const res = await calculateKitchenIngredients(eventId, newWastage, token);
      if (res?.data) {
        setCalcResult(res.data);
      }
    } catch {
      // retain previous
    } finally {
      setCalcLoading(false);
    }
  };

  // Extract catering food menu items
  const menuData = useMemo(() => {
    const booking = event?.booking && typeof event.booking === "object" ? event.booking : null;
    const foodMenu = booking?.foodMenu || staffingData?.event?.foodMenu || (event as any)?.foodMenu;

    const items: Array<{
      foodItemId?: string | null;
      name: string;
      category: string;
      dietary: string;
      rate?: number | null;
      quantity?: number | null;
      amount?: number | null;
      notes?: string;
    }> = foodMenu?.items || [];

    const servingType = foodMenu?.servingType || "PER_GUEST";
    const guestCount =
      event?.guests ||
      booking?.guests ||
      staffingData?.event?.guests ||
      calcResult?.guests ||
      0;
    const ratePerGuest = foodMenu?.ratePerGuest ?? null;
    const totalFoodAmount = foodMenu?.totalFoodAmount ?? null;
    const foodNotes = foodMenu?.notes || "";

    return {
      items,
      servingType,
      guestCount,
      ratePerGuest,
      totalFoodAmount,
      foodNotes,
    };
  }, [event, staffingData, calcResult]);

  // Dietary counts
  const dietaryBreakdown = useMemo(() => {
    const counts = { veg: 0, nonVeg: 0, egg: 0, vegan: 0, total: 0 };
    menuData.items.forEach((item) => {
      counts.total++;
      const d = (item.dietary || "").toLowerCase();
      if (d === "veg" || d === "vegetarian") counts.veg++;
      else if (d === "non-veg" || d === "non_veg" || d === "non-vegetarian") counts.nonVeg++;
      else if (d === "egg") counts.egg++;
      else if (d === "vegan") counts.vegan++;
      else counts.veg++;
    });
    return counts;
  }, [menuData.items]);

  // Unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    menuData.items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [menuData.items]);

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuData.items.filter((item) => {
      const matchesSearch =
        !menuSearch.trim() ||
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.category?.toLowerCase().includes(menuSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuData.items, menuSearch, selectedCategory]);

  // Flat list of chef grocery items requested via Purchase Requests
  const chefGroceries = useMemo(() => {
    return purchaseRequests.flatMap((pr) =>
      (pr.items || []).map((it) => ({
        ...it,
        requestId: pr._id,
        requestStatus: pr.status,
        requestedBy: pr.requestedBy?.name || "Kitchen Staff",
        requestNotes: pr.notes || "",
        createdAt: pr.createdAt,
      }))
    );
  }, [purchaseRequests]);

  // Dietary tag badge helper
  const renderDietaryBadge = (dietary: string) => {
    const d = (dietary || "").toLowerCase();
    if (d === "veg" || d === "vegetarian") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          Vegetarian
        </span>
      );
    }
    if (d === "non-veg" || d === "non_veg" || d === "non-vegetarian") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
          <span className="h-2 w-2 rounded-full bg-rose-600" />
          Non-Veg
        </span>
      );
    }
    if (d === "egg") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Egg
        </span>
      );
    }
    if (d === "vegan") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-teal-300 bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
          <Leaf size={11} className="text-teal-600" />
          Vegan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-bold text-gray-700 capitalize">
        {dietary || "Standard"}
      </span>
    );
  };

  // Status badge for purchase requests
  const renderPurchaseStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "FULFILLED") {
      return (
        <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">
          Fulfilled / Stocked
        </span>
      );
    }
    if (s === "PARTIALLY_FULFILLED") {
      return (
        <span className="rounded-md border border-indigo-300 bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-800">
          Partially Received
        </span>
      );
    }
    if (s === "APPROVED") {
      return (
        <span className="rounded-md border border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] font-black text-sky-800">
          Approved (Ready to Restock)
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-800">
          Rejected
        </span>
      );
    }
    if (s === "CANCELLED") {
      return (
        <span className="rounded-md border border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-black text-gray-600">
          Cancelled
        </span>
      );
    }
    return (
      <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-800">
        Pending Review
      </span>
    );
  };

  const handleApproveRequest = async (pr: PurchaseRequestRecord) => {
    if (!token) return;
    try {
      setReviewSubmitting(true);
      await reviewKitchenPurchaseRequest(pr._id, { status: "APPROVED" }, token);
      setActionSuccess(`Grocery order #${pr._id.slice(-6).toUpperCase()} approved! You can now receive goods.`);
      setReviewModalPr(null);
      await fetchEventData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleRejectRequest = async (pr: PurchaseRequestRecord) => {
    if (!token) return;
    if (!rejectionReasonInput.trim()) {
      alert("Please provide a reason for rejecting this grocery request.");
      return;
    }
    try {
      setReviewSubmitting(true);
      await reviewKitchenPurchaseRequest(
        pr._id,
        { status: "REJECTED", rejectionReason: rejectionReasonInput.trim() },
        token
      );
      setActionSuccess(`Grocery order #${pr._id.slice(-6).toUpperCase()} marked as rejected.`);
      setReviewModalPr(null);
      setRejectionReasonInput("");
      await fetchEventData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const openReceiveModal = (pr: PurchaseRequestRecord) => {
    const initialQty: Record<string, number | string> = {};
    (pr.items || []).forEach((item) => {
      const target =
        item.approvedQuantity !== null && item.approvedQuantity !== undefined
          ? item.approvedQuantity
          : item.shortageQuantity;
      const remaining = Math.max(0, target - (item.receivedQuantity || 0));
      initialQty[item._id] = remaining;
    });
    setReceiveQuantities(initialQty);
    setReceiveNotes("");
    setReceiveModalPr(pr);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !receiveModalPr) return;

    const receivedItems = Object.entries(receiveQuantities)
      .map(([itemId, qty]) => {
        const num = Number(qty);
        const origItem = receiveModalPr.items.find((i) => i._id === itemId);
        return {
          itemId,
          quantityReceived: num,
          unit: origItem?.unit || "kg",
        };
      })
      .filter((i) => i.quantityReceived > 0);

    if (receivedItems.length === 0) {
      alert("Please enter a positive delivery quantity for at least one item.");
      return;
    }

    try {
      setReceiveSubmitting(true);
      const idempotencyKey = `rcpt_${receiveModalPr._id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await receiveKitchenPurchaseRequest(
        receiveModalPr._id,
        {
          receivedItems,
          notes: receiveNotes.trim() || undefined,
          idempotencyKey,
        },
        token
      );
      setActionSuccess("Goods received and warehouse stock successfully updated!");
      setReceiveModalPr(null);
      await fetchEventData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to receive goods");
    } finally {
      setReceiveSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        <p className="text-sm font-semibold text-[#785122]">
          Loading Catering Menus & Kitchen Recipe Details...
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-4xl py-10">
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center">
          <XCircle size={40} className="mx-auto text-rose-600 mb-3" />
          <h2 className="text-lg font-bold text-rose-950">Unable to load Catering Details</h2>
          <p className="mt-1 text-sm text-rose-700">{error || "Event not found or unauthorized access."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={`/manager/events/${eventId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-gray-800 border border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft size={14} />
              Back to Event Details
            </Link>
            <button
              type="button"
              onClick={() => fetchEventData()}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/manager/events/${eventId}`}
            id="back-to-event-details-btn"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#ede5d8] bg-white text-[#785122] shadow-2xs transition hover:bg-[#faf6f0] hover:scale-105 active:scale-95"
            title="Back to Event Details"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-100 border border-amber-300/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                Catering & Culinary Management
              </span>
              <span className="text-xs font-mono text-gray-400">ID: {eventId.slice(-8)}</span>
            </div>
            <h1 className="mt-0.5 text-xl sm:text-2xl font-black text-[#29241f] tracking-tight">
              {event.eventName}
            </h1>
          </div>
        </div>

        {/* Quick Meta Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl border border-[#ede5d8] bg-white px-3 py-1.5 font-bold text-[#29241f] shadow-2xs">
            <Calendar size={14} className="text-[#9a6c37]" />
            <span>{event.eventDate}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-[#ede5d8] bg-white px-3 py-1.5 font-bold text-[#29241f] shadow-2xs">
            <Users size={14} className="text-[#9a6c37]" />
            <span>{menuData.guestCount} Guests</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 rounded-xl border border-[#ede5d8] bg-white px-3 py-1.5 text-gray-600 shadow-2xs max-w-[200px] truncate">
              <MapPin size={14} className="text-[#9a6c37] shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
  

      {/* 3. Section Tabs & Wastage Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#ede5d8] bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "all"
                ? "bg-[#785122] text-white shadow-xs"
                : "bg-[#faf8f5] text-gray-700 hover:bg-[#f3ede4]"
            }`}
          >
            All Sections
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("menu")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "menu"
                ? "bg-[#785122] text-white shadow-xs"
                : "bg-[#faf8f5] text-gray-700 hover:bg-[#f3ede4]"
            }`}
          >
            <Utensils size={13} />
            <span>Catering Menu ({menuData.items.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recipe_calc")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "recipe_calc"
                ? "bg-[#785122] text-white shadow-xs"
                : "bg-[#faf8f5] text-gray-700 hover:bg-[#f3ede4]"
            }`}
          >
            <ChefHat size={13} />
            <span>Recipe Requirements ({calcResult?.aggregatedIngredients?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("groceries")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "groceries"
                ? "bg-[#785122] text-white shadow-xs"
                : "bg-[#faf8f5] text-gray-700 hover:bg-[#f3ede4]"
            }`}
          >
            <ShoppingCart size={13} />
            <span>Chef Groceries ({chefGroceries.length})</span>
          </button>
        </div>

        {/* Wastage Allowance Control */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-2 sm:border-t-0 sm:pt-0">
          <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
            <SlidersHorizontal size={12} />
            Kitchen Wastage:
          </span>
          <div className="flex items-center gap-1 rounded-xl bg-[#faf8f5] p-1 border border-[#ede5d8]">
            {[0, 5, 10].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleWastageChange(pct)}
                disabled={calcLoading}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                  wastagePercent === pct
                    ? "bg-[#785122] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
          {calcLoading && <Loader2 size={13} className="animate-spin text-[#9a6c37]" />}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: CLIENT-SELECTED CATERING MENU */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "menu") && (
        <section className="rounded-3xl border border-[#ede5d8] bg-white p-5 sm:p-6 shadow-sm">
          {/* Header & Filters */}
          <div className="flex flex-col gap-4 border-b border-[#f1ece5] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Utensils size={15} />
                </div>
                <h2 className="text-base font-extrabold text-[#29241f]">
                  Client-Selected Food & Beverage Menu
                </h2>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Dishes and beverages confirmed for this booking with guest portion counts and itemized pricing where available.
              </p>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[180px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter dishes..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#faf8f5] pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-[#9a6c37] focus:outline-none focus:bg-white"
                />
              </div>

              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-[#faf8f5] px-3 py-1.5 text-xs text-gray-700 font-medium focus:border-[#9a6c37] focus:outline-none"
                >
                  <option value="ALL">All Categories ({menuData.items.length})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Special Preparation / Client Dietary Notes Banner */}
          {menuData.foodNotes && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3.5 text-xs text-amber-950">
              <Info size={16} className="text-amber-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold">Special Client Notes & Dietary Guidelines: </span>
                <span>{menuData.foodNotes}</span>
              </div>
            </div>
          )}

          {/* Menu Table / Cards */}
          {filteredMenuItems.length === 0 ? (
            <div className="py-12 text-center">
              <Utensils size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-600">No catering items match your selection</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {menuData.items.length === 0
                  ? "No catering menu items have been added to this event booking."
                  : "Try clearing your search query or category filter."}
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f1ece5] bg-[#faf8f5]/60 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    <th className="py-3 px-3">No.</th>
                    <th className="py-3 px-3">Dish / Beverage Item</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Dietary Type</th>
                    <th className="py-3 px-3 text-right">Quantity / Guests</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1ece5]">
                  {filteredMenuItems.map((item, idx) => {
                    // Check pricing strictly - do NOT fabricate prices
                    const unitPrice =
                      item.rate !== undefined && item.rate !== null && item.rate > 0
                        ? item.rate
                        : null;
                    const totalPrice =
                      item.amount !== undefined && item.amount !== null && item.amount > 0
                        ? item.amount
                        : unitPrice && item.quantity
                        ? unitPrice * item.quantity
                        : null;

                    const effectiveQuantity = item.quantity || menuData.guestCount;

                    return (
                      <tr key={item.name + idx} className="hover:bg-[#faf8f5]/50 transition">
                        <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-[#29241f] text-sm">{item.name}</div>
                          {item.notes && (
                            <p className="mt-0.5 text-[11px] text-gray-500 italic">
                              Note: {item.notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-600 font-medium">
                          {item.category || "General"}
                        </td>
                        <td className="py-3 px-3">{renderDietaryBadge(item.dietary)}</td>
                        <td className="py-3 px-3 text-right font-bold text-gray-800">
                          {effectiveQuantity} {item.quantity ? "portions" : "guests"}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-700">
                          {unitPrice !== null ? formatINR(unitPrice) : "—"}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#785122]">
                          {totalPrice !== null ? formatINR(totalPrice) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Catering Financial & Serving Scope Footer */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-[#faf8f5] border border-[#ede5d8] p-4 text-xs gap-3">
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div>
                <span className="font-semibold text-gray-500">Serving Type: </span>
                <span className="font-bold text-[#29241f] capitalize">
                  {menuData.servingType.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500">Total Items: </span>
                <span className="font-bold text-[#29241f]">{menuData.items.length} items</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500">Guest Count: </span>
                <span className="font-bold text-[#29241f]">{menuData.guestCount} guests</span>
              </div>
            </div>

            {menuData.totalFoodAmount !== null && menuData.totalFoodAmount > 0 && (
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold block">
                  Catering Subtotal
                </span>
                <span className="text-base font-black text-[#785122]">
                  {formatINR(menuData.totalFoodAmount)}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION B: CALCULATED RECIPE REQUIREMENTS (THEORETICAL) */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "recipe_calc") && (
        <section className="rounded-3xl border border-[#ede5d8] bg-white p-5 sm:p-6 shadow-sm">
          {/* Section Header with Distinction Note */}
          <div className="border-b border-[#f1ece5] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
                    <ChefHat size={15} />
                  </div>
                  <h2 className="text-base font-extrabold text-[#29241f]">
                    Calculated Recipe Ingredient Requirements
                  </h2>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Calculated dynamically from standardized kitchen recipe yields based on{" "}
                  <strong className="text-gray-700">{menuData.guestCount} guests</strong> and a{" "}
                  <strong className="text-gray-700">{wastagePercent}%</strong> kitchen wastage buffer.
                </p>
              </div>

              {/* Aggregated vs Per Dish Toggle */}
              {calcResult?.aggregatedIngredients && calcResult.aggregatedIngredients.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1 text-xs font-bold">
                    {calcResult.aggregatedIngredients.length} Consolidated Ingredients
                  </span>
                </div>
              )}
            </div>

            {/* Important Distinction Banner */}
            <div className="mt-3 rounded-xl bg-purple-50/70 border border-purple-200/80 p-2.5 text-[11px] text-purple-900 flex items-center gap-2">
              <Info size={14} className="shrink-0 text-purple-700" />
              <span>
                <strong>System Note:</strong> The quantities below are theoretical requirements derived from recipe formulas. They are separate from groceries manually requested or purchased by the chef.
              </span>
            </div>
          </div>

          {/* Missing Recipes Warning Box if any */}
          {calcResult?.missingRecipes && calcResult.missingRecipes.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <BadgeAlert size={15} className="text-amber-700" />
                <span>
                  {calcResult.missingRecipes.length} Menu {calcResult.missingRecipes.length === 1 ? "Item Awaiting" : "Items Awaiting"} Recipe Configuration
                </span>
              </div>
              <p className="mt-1 text-[11px] text-amber-800">
                The kitchen has not yet mapped recipe ingredient formulas for the following selected dishes:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {calcResult.missingRecipes.map((mr, idx) => (
                  <span
                    key={mr.name + idx}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/90 border border-amber-300 px-2 py-1 text-[11px] font-semibold text-amber-950"
                  >
                    <span>{mr.name}</span>
                    {mr.category && <span className="text-gray-400 text-[10px]">({mr.category})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recipe Ingredient Breakdown */}
          {!calcResult || (!calcResult.perItemCalculations?.length && !calcResult.aggregatedIngredients?.length) ? (
            <div className="py-12 text-center">
              <ChefHat size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-600">No calculated recipe data available</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Standardized recipe ingredients have not been configured for the selected menu items.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              {/* Consolidated Ingredients Summary Table */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2.5">
                  Consolidated Kitchen Requirements
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-[#ede5d8]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#ede5d8] bg-[#faf8f5] text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        <th className="py-2.5 px-3">Ingredient Name</th>
                        <th className="py-2.5 px-3 text-right">Required Quantity</th>
                        <th className="py-2.5 px-3 text-right">Stock In Kitchen</th>
                        <th className="py-2.5 px-3 text-right">Shortage</th>
                        <th className="py-2.5 px-3">Used In Dishes</th>
                        <th className="py-2.5 px-3 text-center">Stock Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1ece5]">
                      {calcResult.aggregatedIngredients.map((ing, idx) => (
                        <tr key={ing.name + idx} className="hover:bg-[#faf8f5]/40 transition">
                          <td className="py-2.5 px-3 font-bold text-[#29241f]">
                            {ing.name}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-[#785122]">
                            {ing.requiredQuantity} {ing.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-gray-600">
                            {ing.availableQuantity !== null
                              ? `${ing.availableQuantity} ${ing.unit}`
                              : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold">
                            {ing.shortageQuantity && ing.shortageQuantity > 0 ? (
                              <span className="text-rose-700">
                                -{ing.shortageQuantity} {ing.unit}
                              </span>
                            ) : (
                              <span className="text-emerald-700">None</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-gray-500 max-w-[200px] truncate">
                            {ing.usedInMenuItems?.join(", ") || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {ing.hasShortage ? (
                              <span className="inline-flex items-center rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                Shortage
                              </span>
                            ) : ing.availableQuantity !== null ? (
                              <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                In Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                                Unmapped
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Per-Dish Recipe Breakdown */}
              {calcResult.perItemCalculations && calcResult.perItemCalculations.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2.5">
                    Dish-by-Dish Recipe Breakdown
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {calcResult.perItemCalculations
                      .filter((d) => d.ingredients && d.ingredients.length > 0)
                      .map((dish, dIdx) => (
                        <div
                          key={dish.name + dIdx}
                          className="rounded-2xl border border-[#ede5d8] bg-white p-3.5 shadow-2xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                              <span className="font-extrabold text-xs text-[#29241f] flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#9a6c37]" />
                                {dish.name}
                              </span>
                              {dish.category && (
                                <span className="text-[10px] font-semibold text-gray-400 capitalize">
                                  {dish.category}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              {dish.ingredients.map((ing, iIdx) => (
                                <div
                                  key={ing.name + iIdx}
                                  className="flex items-center justify-between rounded-lg bg-[#faf8f5] px-2 py-1 text-[11px]"
                                >
                                  <span className="text-gray-800 font-medium truncate pr-2">
                                    {ing.name}
                                  </span>
                                  <span className="shrink-0 font-bold text-[#785122]">
                                    {ing.requiredQuantity} {ing.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2.5 border-t border-gray-100 pt-1.5 text-[10px] text-gray-400 flex justify-between">
                            <span>{dish.ingredients.length} ingredients</span>
                            <span>Yield: {dish.yieldServings || 1} serv</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION C: CHEF GROCERY & PURCHASE REQUESTS */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "groceries") && (
        <section className="rounded-3xl border border-[#ede5d8] bg-white p-5 sm:p-6 shadow-sm">
          {/* Section Header with Distinction Note */}
          <div className="border-b border-[#f1ece5] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShoppingCart size={15} />
                  </div>
                  <h2 className="text-base font-extrabold text-[#29241f]">
                    Chef Grocery & Purchase Requests
                  </h2>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Actual procurement requests entered by kitchen personnel specifically for this event.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 text-xs font-bold">
                  {chefGroceries.length} Requested Items
                </span>
              </div>
            </div>

            {/* Distinction Banner */}
            <div className="mt-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-2.5 text-[11px] text-emerald-900 flex items-center gap-2">
              <Info size={14} className="shrink-0 text-emerald-700" />
              <span>
                <strong>Procurement Scope:</strong> These records reflect actual kitchen orders sent to the inventory/purchasing desk, including status approvals and special ingredient sourcing.
              </span>
            </div>
          </div>

          {chefGroceries.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-600">No event grocery purchase requests found</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Kitchen staff have not submitted any event-specific purchase orders or special grocery requests for this event yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {actionSuccess && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="font-semibold">{actionSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActionSuccess(null)}
                    className="text-emerald-700 hover:text-emerald-900 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {purchaseRequests.map((pr, pIdx) => {
                const isPending = pr.status === "PENDING";
                const isReadyToReceive =
                  pr.status === "APPROVED" || pr.status === "PARTIALLY_FULFILLED";

                return (
                  <div
                    key={pr._id || pIdx}
                    className="rounded-2xl border border-amber-200/90 bg-[#faf8f5]/60 p-4 shadow-2xs space-y-3"
                  >
                    {/* PR Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ede5d8] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#29241f]">
                          Request #{String(pr._id).slice(-6).toUpperCase()}
                        </span>
                        {renderPurchaseStatusBadge(pr.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isPending && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproveRequest(pr)}
                              disabled={reviewSubmitting}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReviewModalPr(pr);
                                setRejectionReasonInput("");
                              }}
                              disabled={reviewSubmitting}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}

                        {isReadyToReceive && (
                          <button
                            type="button"
                            onClick={() => openReceiveModal(pr)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-[#29241f] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            <Truck size={14} />
                            <span>Receive Goods / Restock Store</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Audit Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
                      <div>
                        Requested by:{" "}
                        <strong className="text-gray-700">
                          {pr.requestedBy?.name || "Kitchen Staff"}
                        </strong>
                        {pr.createdAt && (
                          <span className="ml-2 text-gray-400">
                            ({new Date(pr.createdAt).toLocaleDateString()})
                          </span>
                        )}
                      </div>

                      {pr.approvedBy && (
                        <div>
                          Approved by:{" "}
                          <strong className="text-gray-700">
                            {pr.approvedBy.name}
                          </strong>
                          {pr.approvedAt && (
                            <span className="ml-1 text-gray-400">
                              on {new Date(pr.approvedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {pr.notes && (
                      <div className="text-xs text-amber-900 italic bg-amber-50/80 border border-amber-200/60 rounded-xl p-2.5">
                        <strong>Notes:</strong> {pr.notes}
                      </div>
                    )}

                    {/* Rejection notice */}
                    {pr.status === "REJECTED" && pr.rejectionReason && (
                      <div className="text-xs text-rose-900 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                        <strong>Rejection Reason:</strong> {pr.rejectionReason}
                      </div>
                    )}

                    {/* Items Grid */}
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {(pr.items || []).map((it, iIdx) => {
                        const targetQty =
                          it.approvedQuantity !== null && it.approvedQuantity !== undefined
                            ? it.approvedQuantity
                            : it.shortageQuantity;
                        const receivedQty = it.receivedQuantity || 0;
                        const isFulfilled = receivedQty >= targetQty;

                        return (
                          <div
                            key={it.itemName + iIdx}
                            className="rounded-xl border border-white bg-white p-3 shadow-2xs flex flex-col justify-between text-xs space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-gray-800 truncate">
                                {it.itemName}
                              </span>
                              {isFulfilled ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                  <CheckCheck size={11} /> Stocked
                                </span>
                              ) : receivedQty > 0 ? (
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                                  Partial
                                </span>
                              ) : null}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                              <span>
                                Shortage:{" "}
                                <strong className="text-gray-800">
                                  {it.shortageQuantity} {it.unit}
                                </strong>
                              </span>
                              <span>
                                Received:{" "}
                                <strong
                                  className={
                                    receivedQty > 0 ? "text-emerald-700" : "text-gray-400"
                                  }
                                >
                                  {receivedQty} / {targetQty} {it.unit}
                                </strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Receipt History Log */}
                    {pr.receipts && pr.receipts.length > 0 && (
                      <div className="pt-2 border-t border-[#ede5d8] text-[11px] text-gray-500">
                        <span className="font-bold text-[#29241f] block mb-1">
                          Delivery Receipts ({pr.receipts.length}):
                        </span>
                        <div className="space-y-1">
                          {pr.receipts.map((rc, rIdx) => (
                            <div
                              key={rc.receiptId || rIdx}
                              className="bg-white/80 rounded-lg p-1.5 px-2 border border-stone-200/60 flex items-center justify-between"
                            >
                              <span>
                                Received on{" "}
                                {new Date(rc.receivedAt).toLocaleDateString()} by{" "}
                                <strong className="text-gray-700">
                                  {rc.receivedBy?.name || "Storekeeper"}
                                </strong>
                                {rc.notes ? ` (${rc.notes})` : ""}:{" "}
                                <span className="text-amber-900 font-medium">
                                  {rc.items
                                    .map(
                                      (it) =>
                                        `${it.itemName}: +${it.quantityReceived} ${it.unit}`
                                    )
                                    .join(", ")}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT PURCHASE REQUEST REASON */}
      {/* ========================================================================= */}
      {reviewModalPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-rose-800 flex items-center gap-2">
                <XCircle size={18} />
                <span>Reject Grocery Request</span>
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalPr(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Please provide a clear reason why Request #
              {reviewModalPr._id.slice(-6).toUpperCase()} cannot be fulfilled. This
              will be shared with the kitchen team.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Budget exhausted, item unavailable with vendor, or sufficient alternative available in pantry..."
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReviewModalPr(null)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectRequest(reviewModalPr)}
                disabled={reviewSubmitting || !rejectionReasonInput.trim()}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {reviewSubmitting && <Loader2 size={13} className="animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECEIVE GOODS & RESTOCK INVENTORY */}
      {/* ========================================================================= */}
      {receiveModalPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleReceiveSubmit}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#29241f]">
                    Receive Goods & Restock Store
                  </h3>
                  <p className="text-xs text-gray-500">
                    Request #{receiveModalPr._id.slice(-6).toUpperCase()} • Master
                    Warehouse Inventory Update
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiveModalPr(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-2.5 text-xs text-amber-900">
              Entering delivery counts will instantly credit available quantities in
              the master inventory and record a tamper-proof audit ledger transaction.
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Delivered Items & Quantities
              </label>

              {receiveModalPr.items.map((it) => {
                const target =
                  it.approvedQuantity !== null && it.approvedQuantity !== undefined
                    ? it.approvedQuantity
                    : it.shortageQuantity;
                const previouslyReceived = it.receivedQuantity || 0;
                const pending = Math.max(0, target - previouslyReceived);

                return (
                  <div
                    key={it._id}
                    className="p-3 rounded-2xl border border-stone-200 bg-[#faf8f5] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 truncate">{it.itemName}</p>
                      <p className="text-[11px] text-gray-500">
                        Requested: {target} {it.unit} • Received so far:{" "}
                        <strong className="text-emerald-700">
                          {previouslyReceived} {it.unit}
                        </strong>{" "}
                        • Remaining: {pending} {it.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-bold text-gray-500">
                        Deliver:
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={receiveQuantities[it._id] ?? ""}
                        onChange={(e) =>
                          setReceiveQuantities({
                            ...receiveQuantities,
                            [it._id]: e.target.value,
                          })
                        }
                        className="w-20 rounded-xl border border-stone-300 bg-white p-1.5 px-2 text-center text-xs font-bold text-gray-900 focus:border-amber-600 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-gray-600 w-8">
                        {it.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Delivery Notes / Vendor Invoice Number (Optional)
              </label>
              <input
                type="text"
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
                placeholder="e.g. Metro Cash & Carry, Invoice #58209, fresh stock"
                className="w-full rounded-xl border border-gray-200 p-2 text-xs focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReceiveModalPr(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={receiveSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-[#29241f] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {receiveSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ArrowDownToLine size={14} />
                )}
                <span>Confirm Delivery & Restock</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

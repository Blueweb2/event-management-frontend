"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Utensils,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  MapPin,
  ChevronRight,
  Package,
  Plus,
  RefreshCw,
  Loader2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Send,
  X,
  Search,
  BookOpen,
  Info,
} from "lucide-react";

import {
  getKitchenEvents,
  getKitchenEventDetail,
  calculateKitchenIngredients,
  createKitchenPurchaseRequest,
  getKitchenPurchaseRequests,
  getRecipes,
  upsertRecipe,
  getKitchenTasks,
  createKitchenTask,
  updateKitchenTaskStatus,
  type KitchenEventItem,
  type IngredientCalculationResult,
  type RecipeItem,
  type PurchaseRequestRecord,
  type DepartmentTask,
} from "@/lib/department.api";

interface KitchenDashboardProps {
  token: string;
}

export default function KitchenDashboard({ token }: KitchenDashboardProps) {
  const [activeTab, setActiveTab] = useState<"EVENTS" | "CALCULATOR" | "RECIPES" | "REQUISITIONS" | "TASKS">("EVENTS");
  const [events, setEvents] = useState<KitchenEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected event for calculation/detail
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventDetail, setSelectedEventDetail] = useState<KitchenEventItem | null>(null);
  const [calculationResult, setCalculationResult] = useState<IngredientCalculationResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [wastagePercent, setWastagePercent] = useState<number>(5);

  // Recipes state
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeForm, setRecipeForm] = useState<{
    foodItemName: string;
    category: string;
    yieldServings: number;
    defaultWastagePercent: number;
    ingredients: Array<{ name: string; quantityPerServing: number; unit: string; notes?: string }>;
  }>({
    foodItemName: "",
    category: "Main Course",
    yieldServings: 1,
    defaultWastagePercent: 5,
    ingredients: [{ name: "", quantityPerServing: 0.1, unit: "kg" }],
  });

  // Requisitions state
  const [requisitions, setRequisitions] = useState<PurchaseRequestRecord[]>([]);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [reqNotes, setReqNotes] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskCreating, setTaskCreating] = useState(false);

  // Load Initial Data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [eventsRes, recipesRes, reqRes, tasksRes] = await Promise.all([
        getKitchenEvents({}, token),
        getRecipes({}, token),
        getKitchenPurchaseRequests("", token),
        getKitchenTasks("", token),
      ]);

      setEvents(eventsRes.data || []);
      setRecipes(recipesRes.data || []);
      setRequisitions(reqRes.data || []);
      setTasks(tasksRes.data || []);

      if (eventsRes.data && eventsRes.data.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsRes.data[0].eventId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load kitchen dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      void loadInitialData();
    }
  }, [token]);

  // Load Event Detail & Calculation when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId || !token) return;

    const runCalc = async () => {
      try {
        setCalcLoading(true);
        const [detailRes, calcRes] = await Promise.all([
          getKitchenEventDetail(selectedEventId, token),
          calculateKitchenIngredients(selectedEventId, wastagePercent, token),
        ]);
        setSelectedEventDetail(detailRes.data);
        setCalculationResult(calcRes.data);
      } catch (err) {
        console.error("Calculation fetch error:", err);
      } finally {
        setCalcLoading(false);
      }
    };

    void runCalc();
  }, [selectedEventId, wastagePercent, token]);

  // Handle Recipe Form Save
  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !recipeForm.foodItemName.trim()) return;

    try {
      await upsertRecipe(recipeForm, token);
      setSuccessMsg(`Recipe for "${recipeForm.foodItemName}" saved successfully.`);
      setIsRecipeModalOpen(false);
      // Reload recipes and recalculate if event selected
      const updated = await getRecipes({}, token);
      setRecipes(updated.data || []);
      if (selectedEventId) {
        const calcRes = await calculateKitchenIngredients(selectedEventId, wastagePercent, token);
        setCalculationResult(calcRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe");
    }
  };

  // Handle Requisition submission for shortages
  const handleSubmitRequisition = async () => {
    if (!token || !calculationResult || calculationResult.shortages.length === 0) return;

    try {
      setReqSubmitting(true);
      const items = calculationResult.shortages
        .filter((s) => s.shortageQuantity !== null && s.shortageQuantity > 0)
        .map((s) => ({
          itemName: s.name,
          requiredQuantity: s.requiredQuantity,
          availableQuantity: s.availableQuantity ?? 0,
          shortageQuantity: s.shortageQuantity ?? 0,
          unit: s.unit,
          estimatedCost: 0,
          urgency: "HIGH" as const,
          stockItem: s.stockItemId || undefined,
          notes: `Required for event: ${calculationResult.eventName}`,
        }));

      await createKitchenPurchaseRequest(
        {
          eventId: calculationResult.eventId,
          items,
          notes: reqNotes || `Shortage requisition generated for ${calculationResult.eventName}`,
        },
        token
      );

      setSuccessMsg("Purchase requisition submitted to executive administration.");
      setIsReqModalOpen(false);
      setReqNotes("");
      const reqRes = await getKitchenPurchaseRequests("", token);
      setRequisitions(reqRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit purchase request");
    } finally {
      setReqSubmitting(false);
    }
  };

  // Handle Kitchen Task creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTaskTitle.trim() || !selectedEventId) return;

    try {
      setTaskCreating(true);
      await createKitchenTask(
        {
          eventId: selectedEventId,
          title: newTaskTitle.trim(),
          dutyTitle: "Kitchen Prep Crew",
        },
        token
      );
      setNewTaskTitle("");
      setSuccessMsg("Kitchen preparation task added.");
      const updatedTasks = await getKitchenTasks("", token);
      setTasks(updatedTasks.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add prep task");
    } finally {
      setTaskCreating(false);
    }
  };

  const handleToggleTaskStatus = async (dutyId: string, taskId: string, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    try {
      await updateKitchenTaskStatus(dutyId, taskId, { status: nextStatus }, token);
      const updatedTasks = await getKitchenTasks("", token);
      setTasks(updatedTasks.data || []);
    } catch (err) {
      console.error("Task update error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================
          KITCHEN HEADER
      ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#1e1b18] via-[#171512] to-[#0e0d0b] p-6 sm:p-8 shadow-2xl text-white">
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              <Utensils size={14} />
              Executive Chef & Kitchen Management Console
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Kitchen Operations & Ingredient Calculations
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-xl">
              Real-time confirmed menus, dietary breakdowns, exact recipe-based ingredient demand calculations, live warehouse stock reconciliation, and shortage requisitions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadInitialData}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-300 transition hover:bg-white/10"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRecipeModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-4 text-xs font-bold text-black shadow-lg shadow-amber-600/20 transition hover:scale-[1.02] active:scale-95"
            >
              <Plus size={15} />
              <span>Configure Recipe</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-5">
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <p className="text-[11px] font-medium text-gray-400">Kitchen Events</p>
            <p className="text-xl font-bold text-white mt-0.5">{events.length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <p className="text-[11px] font-medium text-gray-400">Configured Recipes</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{recipes.length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <p className="text-[11px] font-medium text-gray-400">Active Shortages</p>
            <p className={`text-xl font-bold mt-0.5 ${calculationResult?.hasAnyShortage ? "text-rose-400" : "text-emerald-400"}`}>
              {calculationResult?.shortages.length || 0}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <p className="text-[11px] font-medium text-gray-400">Requisitions Pending</p>
            <p className="text-xl font-bold text-sky-400 mt-0.5">
              {requisitions.filter((r) => r.status === "PENDING").length}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          ALERTS
      ========================================================= */}
      {successMsg && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* =========================================================
          SUB-NAVIGATION TABS
      ========================================================= */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: "EVENTS", label: "Confirmed Menus & Events", icon: Calendar },
          { id: "CALCULATOR", label: "Ingredient Requirement Engine", icon: Calculator },
          { id: "RECIPES", label: "Recipe & Portion Library", icon: BookOpen },
          { id: "REQUISITIONS", label: "Shortage Requisitions", icon: Package },
          { id: "TASKS", label: "Kitchen Prep Tasks", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? "bg-[#252525] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
              }`}
            >
              <Icon size={14} className={isActive ? "text-amber-400" : "text-gray-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          TAB 1: CONFIRMED MENUS & EVENTS (READ-ONLY)
      ========================================================= */}
      {activeTab === "EVENTS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Confirmed Kitchen Events ({events.length})
            </h2>

            {events.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-xs text-gray-500">
                No confirmed events with catering or food menu.
              </div>
            ) : (
              events.map((ev) => {
                const isSelected = selectedEventId === ev.eventId;
                return (
                  <div
                    key={ev.eventId}
                    onClick={() => setSelectedEventId(ev.eventId)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/5 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-[#1F1F1F] truncate">{ev.eventName}</h3>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {ev.status}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-amber-600" />
                        <span>{new Date(ev.eventDate).toLocaleDateString()} · {ev.eventTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={13} className="text-amber-600" />
                        <span className="font-semibold text-gray-900">{ev.guests} Guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-amber-600" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </div>

                    {/* Dietary Badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2.5">
                      {ev.dietarySummary.veg > 0 && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          Veg: {ev.dietarySummary.veg}
                        </span>
                      )}
                      {ev.dietarySummary.nonVeg > 0 && (
                        <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                          Non-Veg: {ev.dietarySummary.nonVeg}
                        </span>
                      )}
                      {ev.dietarySummary.vegan > 0 && (
                        <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                          Vegan: {ev.dietarySummary.vegan}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Event Confirmed Menu View */}
          <div className="lg:col-span-2">
            {selectedEventDetail ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                      Confirmed Customer Menu (Read-Only)
                    </span>
                    <h2 className="mt-2 text-xl font-extrabold text-[#1F1F1F]">
                      {selectedEventDetail.eventName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Customer confirmed selections. Modifying booking pricing or client items is restricted to sales.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("CALCULATOR")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#252525] px-4 py-2 text-xs font-bold text-white transition hover:bg-black"
                  >
                    <Calculator size={14} className="text-amber-400" />
                    <span>Run Ingredient Calculation</span>
                  </button>
                </div>

                {/* Event Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Guest Count</p>
                    <p className="text-lg font-bold text-gray-900">{selectedEventDetail.guests}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Service Style</p>
                    <p className="text-sm font-bold text-gray-900">{selectedEventDetail.foodMenu.servingType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Dietary Notes</p>
                    <p className="text-xs text-gray-700 truncate">{selectedEventDetail.foodMenu.notes || "None specified"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Menu Items</p>
                    <p className="text-lg font-bold text-amber-700">{selectedEventDetail.foodMenu.items.length}</p>
                  </div>
                </div>

                {/* Confirmed Food Items Table */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Utensils size={15} className="text-amber-600" />
                    Confirmed Menu Dishes & Portions
                  </h3>

                  <div className="overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Dish Name</th>
                          <th className="px-4 py-3 font-semibold">Category</th>
                          <th className="px-4 py-3 font-semibold">Classification</th>
                          <th className="px-4 py-3 font-semibold">Recipe Configured?</th>
                          <th className="px-4 py-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedEventDetail.foodMenu.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-bold text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-gray-600">{item.category}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                  item.dietary === "non-veg"
                                    ? "bg-rose-100 text-rose-800"
                                    : item.dietary === "vegan"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {item.dietary?.toUpperCase() || "VEG"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {item.hasRecipe ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                                  <CheckCircle2 size={13} />
                                  Configured ({item.ingredientsCount} ingredients)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                                  <AlertTriangle size={13} />
                                  Missing Recipe
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {!item.hasRecipe && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRecipeForm({
                                      foodItemName: item.name,
                                      category: item.category || "Main Course",
                                      yieldServings: 1,
                                      defaultWastagePercent: 5,
                                      ingredients: [{ name: "", quantityPerServing: 0.1, unit: "kg" }],
                                    });
                                    setIsRecipeModalOpen(true);
                                  }}
                                  className="text-[11px] font-bold text-amber-700 hover:underline"
                                >
                                  Configure Recipe →
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-400">
                Select an event from the list to view confirmed customer menu specifications.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: INGREDIENT REQUIREMENT ENGINE
      ========================================================= */}
      {activeTab === "CALCULATOR" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-700">Target Event:</label>
              <select
                value={selectedEventId || ""}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-900 outline-none"
              >
                {events.map((e) => (
                  <option key={e.eventId} value={e.eventId}>
                    {e.eventName} ({e.guests} guests)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-700">
                Wastage Allowance Allowance:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={wastagePercent}
                  onChange={(e) => setWastagePercent(Number(e.target.value) || 0)}
                  className="h-9 w-16 rounded-xl border border-gray-200 text-center text-xs font-bold text-gray-900"
                />
                <span className="text-xs font-bold text-gray-500">%</span>
              </div>
            </div>
          </div>

          {calcLoading ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-gray-200 bg-white">
              <Loader2 size={32} className="animate-spin text-amber-600" />
            </div>
          ) : calculationResult ? (
            <div className="space-y-6">
              {/* Missing Recipe Warning Banner */}
              {calculationResult.missingRecipesCount > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-50 p-4 text-xs text-amber-900">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900">
                        {calculationResult.missingRecipesCount} menu item(s) are missing configured recipes!
                      </p>
                      <p className="mt-0.5 text-amber-700">
                        Quantities cannot be invented. The calculation engine only computes exact requirements for items with configured recipes.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {calculationResult.missingRecipes.map((m, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setRecipeForm({
                                foodItemName: m.name,
                                category: m.category || "Main Course",
                                yieldServings: 1,
                                defaultWastagePercent: 5,
                                ingredients: [{ name: "", quantityPerServing: 0.1, unit: "kg" }],
                              });
                              setIsRecipeModalOpen(true);
                            }}
                            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-300 shadow-sm hover:bg-amber-100"
                          >
                            + Add Recipe: {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shortage Alert Banner */}
              {calculationResult.hasAnyShortage && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-rose-500/30 bg-rose-50 p-4 text-xs text-rose-900">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="shrink-0 text-rose-600" />
                    <div>
                      <p className="font-bold">
                        Inventory Shortage Detected ({calculationResult.shortages.length} ingredient items)
                      </p>
                      <p className="text-rose-700">
                        Total required ingredient demand exceeds warehouse stock available.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReqModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
                  >
                    <Send size={14} />
                    <span>Generate Purchase Requisition</span>
                  </button>
                </div>
              )}

              {/* Unmapped Stock & Unit Mismatch Notice */}
              {calculationResult.aggregatedIngredients.some((i) => i.hasStockMapping === false || i.isUnitCompatible === false) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 space-y-1">
                  <div className="flex items-start gap-2.5">
                    <Info size={18} className="shrink-0 text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">
                        Inventory Mapping Notice
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        Items designated as <span className="font-bold text-slate-800">Missing Stock Mapping</span> are not linked to warehouse stock items and are not assumed to be zero inventory. Items designated as <span className="font-bold text-amber-800">Unit Mismatch</span> require unit alignment before live stock comparisons can be computed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Aggregated Requirements Table */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-amber-600" />
                    Total Ingredient Requirements & Live Stock Comparison
                  </h3>
                  <span className="text-xs text-gray-500">
                    {calculationResult.guests} Guests · {wastagePercent}% Wastage Allowance
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Ingredient</th>
                        <th className="px-4 py-3 font-semibold">Dishes Used In</th>
                        <th className="px-4 py-3 font-semibold">Total Required</th>
                        <th className="px-4 py-3 font-semibold">Warehouse Stock Available</th>
                        <th className="px-4 py-3 font-semibold">Shortage Quantity</th>
                        <th className="px-4 py-3 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {calculationResult.aggregatedIngredients.map((ing, idx) => {
                        const isUnmapped = ing.hasStockMapping === false;
                        const isMismatch = ing.isUnitCompatible === false;
                        const isShortage = !isUnmapped && !isMismatch && Boolean(ing.hasShortage && ing.shortageQuantity && ing.shortageQuantity > 0);

                        return (
                          <tr
                            key={idx}
                            className={
                              isShortage
                                ? "bg-rose-50/40"
                                : isMismatch
                                ? "bg-amber-50/30"
                                : isUnmapped
                                ? "bg-slate-50/40"
                                : "hover:bg-gray-50/50"
                            }
                          >
                            <td className="px-4 py-3 font-bold text-gray-900">
                              <div>{ing.name}</div>
                              {isMismatch && ing.unitMismatchWarning && (
                                <p className="text-[10px] text-amber-700 font-normal mt-0.5">
                                  {ing.unitMismatchWarning}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{ing.usedInMenuItems.join(", ")}</td>
                            <td className="px-4 py-3 font-bold text-gray-900">
                              {ing.requiredQuantity} {ing.unit}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-700">
                              {isUnmapped ? (
                                <span className="text-slate-500 italic font-medium inline-flex items-center gap-1">
                                  <Info size={12} className="text-slate-400" />
                                  Not Mapped
                                </span>
                              ) : isMismatch ? (
                                <div>
                                  <span>
                                    {ing.stockItemAvailableQuantity ?? ing.availableQuantity ?? "—"} {ing.stockItemUnit || ing.unit}
                                  </span>
                                  <span className="block text-[10px] text-amber-600 font-medium">Incompatible unit</span>
                                </div>
                              ) : (
                                <span>
                                  {ing.availableQuantity ?? 0} {ing.unit}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-bold">
                              {isUnmapped ? (
                                <span className="text-gray-400 font-medium italic">— (Not Mapped)</span>
                              ) : isMismatch ? (
                                <span className="text-amber-700 font-medium text-[11px] inline-flex items-center gap-1" title={ing.unitMismatchWarning || "Incompatible units"}>
                                  <AlertTriangle size={13} className="shrink-0 text-amber-600" />
                                  Unit Mismatch
                                </span>
                              ) : isShortage ? (
                                <span className="text-rose-600 font-extrabold">
                                  {ing.shortageQuantity} {ing.unit}
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-bold">
                                  0 {ing.unit}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isUnmapped ? (
                                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 inline-flex items-center gap-1">
                                  <Info size={11} className="text-slate-500" />
                                  Missing Stock Mapping
                                </span>
                              ) : isMismatch ? (
                                <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 inline-flex items-center gap-1">
                                  <AlertTriangle size={11} className="text-amber-600" />
                                  Unit Mismatch
                                </span>
                              ) : isShortage ? (
                                <span className="rounded-full bg-rose-100 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 inline-flex items-center gap-1">
                                  <AlertTriangle size={11} className="text-rose-600" />
                                  Shortage
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 inline-flex items-center gap-1">
                                  <CheckCircle2 size={11} className="text-emerald-600" />
                                  Sufficient Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3 text-[11px] text-gray-500 flex items-center gap-2">
                  <Info size={14} className="shrink-0 text-gray-400" />
                  <span>
                    <strong>Inventory Invariant:</strong> Raw stock is NOT deducted merely because an event is booked or a calculation is generated. Deduction occurs strictly upon verified kitchen dispatch and issues.
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* =========================================================
          TAB 3: RECIPES LIBRARY
      ========================================================= */}
      {activeTab === "RECIPES" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Configured Recipes & Ingredient Yields ({recipes.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                setRecipeForm({
                  foodItemName: "",
                  category: "Main Course",
                  yieldServings: 1,
                  defaultWastagePercent: 5,
                  ingredients: [{ name: "", quantityPerServing: 0.1, unit: "kg" }],
                });
                setIsRecipeModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#252525] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-black"
            >
              <Plus size={14} />
              <span>Add Recipe</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe._id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-sm text-gray-900">{recipe.foodItemName}</h4>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    {recipe.category}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Yield: {recipe.yieldServings} Serving(s) · Default Wastage: {recipe.defaultWastagePercent}%
                </p>

                <div className="mt-3 border-t border-gray-100 pt-2.5">
                  <p className="text-[11px] font-bold text-gray-700 mb-1.5">Ingredients / Portion:</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>{ing.name}</span>
                        <span className="font-semibold text-gray-900">
                          {ing.quantityPerServing} {ing.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: SHORTAGE REQUISITIONS
      ========================================================= */}
      {activeTab === "REQUISITIONS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Kitchen Purchase Requisitions ({requisitions.length})
            </h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Items Requested</th>
                  <th className="px-4 py-3 font-semibold">Requested By</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requisitions.map((req) => (
                  <tr key={req._id}>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {req.items.map((i) => `${i.itemName} (${i.shortageQuantity} ${i.unit})`).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{req.requestedBy?.name || "Chef"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          req.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : req.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{req.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: KITCHEN PREP TASKS
      ========================================================= */}
      {activeTab === "TASKS" && (
        <div className="space-y-6">
          {/* Add Task Form */}
          <form onSubmit={handleCreateTask} className="flex gap-3">
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Marinate meats, peel vegetables, prepare dessert syrup..."
              className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 outline-none focus:border-amber-600"
            />
            <button
              type="submit"
              disabled={taskCreating || !selectedEventId}
              className="inline-flex items-center gap-2 rounded-xl bg-[#252525] px-4 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
            >
              <Plus size={14} />
              <span>Add Prep Task</span>
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === "COMPLETED"}
                    onChange={() => handleToggleTaskStatus(task.dutyId, task.id, task.status)}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <p className={`text-xs font-bold ${task.status === "COMPLETED" ? "line-through text-gray-400" : "text-gray-900"}`}>
                      {task.title}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Event: {task.eventName} · Assigned: {task.staffName}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    task.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          CONFIGURE RECIPE MODAL
      ========================================================= */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-gray-900 text-sm">Configure Recipe & Ingredient Yield</h3>
              <button type="button" onClick={() => setIsRecipeModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={recipeForm.foodItemName}
                  onChange={(e) => setRecipeForm({ ...recipeForm, foodItemName: e.target.value })}
                  placeholder="e.g. Royal Mughlai Biryani"
                  className="w-full h-9 rounded-xl border border-gray-200 px-3 outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Yield Servings</label>
                  <input
                    type="number"
                    min="1"
                    value={recipeForm.yieldServings}
                    onChange={(e) => setRecipeForm({ ...recipeForm, yieldServings: Number(e.target.value) || 1 })}
                    className="w-full h-9 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Wastage %</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={recipeForm.defaultWastagePercent}
                    onChange={(e) => setRecipeForm({ ...recipeForm, defaultWastagePercent: Number(e.target.value) || 5 })}
                    className="w-full h-9 rounded-xl border border-gray-200 px-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-gray-700">Ingredients (per serving yield)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setRecipeForm({
                        ...recipeForm,
                        ingredients: [...recipeForm.ingredients, { name: "", quantityPerServing: 0.1, unit: "kg" }],
                      })
                    }
                    className="text-amber-700 font-bold hover:underline"
                  >
                    + Add Ingredient
                  </button>
                </div>

                <div className="space-y-2">
                  {recipeForm.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Ingredient name (e.g. Basmati Rice)"
                        value={ing.name}
                        onChange={(e) => {
                          const updated = [...recipeForm.ingredients];
                          updated[idx].name = e.target.value;
                          setRecipeForm({ ...recipeForm, ingredients: updated });
                        }}
                        className="flex-1 h-8 rounded-lg border border-gray-200 px-2.5 text-xs outline-none"
                      />
                      <input
                        type="number"
                        step="0.001"
                        required
                        placeholder="Qty"
                        value={ing.quantityPerServing}
                        onChange={(e) => {
                          const updated = [...recipeForm.ingredients];
                          updated[idx].quantityPerServing = Number(e.target.value) || 0;
                          setRecipeForm({ ...recipeForm, ingredients: updated });
                        }}
                        className="w-20 h-8 rounded-lg border border-gray-200 px-2 text-xs text-center outline-none"
                      />
                      <select
                        value={ing.unit}
                        onChange={(e) => {
                          const updated = [...recipeForm.ingredients];
                          updated[idx].unit = e.target.value;
                          setRecipeForm({ ...recipeForm, ingredients: updated });
                        }}
                        className="h-8 rounded-lg border border-gray-200 px-2 text-xs outline-none"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="liter">liter</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          SUBMIT REQUISITION MODAL
      ========================================================= */}
      {isReqModalOpen && calculationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-gray-900 text-sm">Submit Shortage Requisition</h3>
              <button type="button" onClick={() => setIsReqModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600">
                The following shortages will be dispatched to executive administration for procurement approval:
              </p>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1.5 max-h-40 overflow-y-auto">
                {calculationResult.shortages.map((s, idx) => (
                  <div key={idx} className="flex justify-between font-medium">
                    <span>{s.name}</span>
                    <span className="font-bold text-rose-600">
                      {s.shortageQuantity} {s.unit}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Procurement Notes</label>
                <textarea
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  placeholder="e.g. Required urgently for banquet meal service on Friday evening"
                  className="w-full h-20 rounded-xl border border-gray-200 p-2.5 outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setIsReqModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={reqSubmitting}
                  onClick={handleSubmitRequisition}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 disabled:opacity-50"
                >
                  {reqSubmitting ? "Submitting..." : "Send Requisition"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

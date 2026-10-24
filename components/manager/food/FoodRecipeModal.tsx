"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Loader2,
  ChefHat,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
  RefreshCw,
  Layers,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { FoodItem } from "@/lib/food.api";
import {
  getRecipeByFoodItem,
  getRecipes,
  upsertRecipe,
  type RecipeItem,
  type RecipeIngredient,
} from "@/lib/department.api";
import { getStockItems } from "@/lib/stock.api";
import type { StockItem } from "@/types/stock";
import StockIngredientCombobox from "./StockIngredientCombobox";

interface FoodRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItem: FoodItem | null;
  onRecipeSaved?: (recipe: RecipeItem) => void;
}

const COMMON_UNITS = [
  "kg",
  "g",
  "liters",
  "ml",
  "pcs",
  "packets",
  "bunches",
  "tins",
  "dozen",
];

const ELIGIBLE_STOCK_CATEGORIES = ["Raw Ingredients", "Kitchen Supplies"];

export default function FoodRecipeModal({
  isOpen,
  onClose,
  foodItem,
  onRecipeSaved,
}: FoodRecipeModalProps) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Stock inventory state
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  // Recipe state
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [yieldServings, setYieldServings] = useState<number>(1);
  const [defaultWastagePercent, setDefaultWastagePercent] = useState<number>(5);
  const [ingredients, setIngredients] = useState<
    Array<{
      name: string;
      quantityPerServing: number | string;
      unit: string;
      stockItemId: string;
      notes: string;
    }>
  >([]);
  const [chefNotes, setChefNotes] = useState<string>("");

  // Fetch live eligible stock items from MongoDB Stock Management
  const fetchEligibleStockItems = useCallback(async () => {
    if (!token) return;
    setStockLoading(true);
    setStockError(null);
    try {
      // Query kitchen stock items from the official master stock endpoint
      const res = await getStockItems(token, { stockType: "kitchen", limit: 500 });
      const rawList: StockItem[] = res.data || [];

      // Filter strictly for eligible kitchen raw ingredients and supplies
      // Exclude rentable items, furniture, audio/visual, and equipment
      const eligible = rawList.filter((item) => {
        const isEligibleCategory =
          ELIGIBLE_STOCK_CATEGORIES.includes(item.category) || item.stockType === "kitchen";
        const isNotEquipment = item.category !== "Kitchen Equipment";
        const isNotRentable = !item.isRentable && item.rentalPrice === 0;
        return isEligibleCategory && isNotEquipment && isNotRentable;
      });

      setStockItems(eligible);
    } catch (err) {
      setStockError(
        err instanceof Error ? err.message : "Failed to load stock inventory items."
      );
    } finally {
      setStockLoading(false);
    }
  }, [token]);

  // Load recipe and stock when modal opens
  useEffect(() => {
    if (!isOpen || !foodItem || !token) return;

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const loadRecipeAndStock = async () => {
      try {
        // Fetch eligible stock items in parallel
        void fetchEligibleStockItems();

        // 1. Try dedicated getRecipeByFoodItem endpoint
        let existingRecipe: RecipeItem | null = null;
        try {
          const singleRes = await getRecipeByFoodItem(foodItem._id, token);
          if (singleRes && singleRes.data) {
            existingRecipe = singleRes.data;
          }
        } catch {
          // Fallback to searching recipe list by food item name
          try {
            const listRes = await getRecipes({ search: foodItem.name }, token);
            existingRecipe =
              (listRes.data || []).find(
                (r: RecipeItem) =>
                  (r.foodItem &&
                    (typeof r.foodItem === "string"
                      ? r.foodItem === foodItem._id
                      : r.foodItem._id === foodItem._id)) ||
                  r.foodItemName?.toLowerCase() === foodItem.name?.toLowerCase()
              ) || null;
          } catch {
            existingRecipe = null;
          }
        }

        if (existingRecipe) {
          setRecipeId(existingRecipe._id);
          setYieldServings(existingRecipe.yieldServings || 1);
          setDefaultWastagePercent(existingRecipe.defaultWastagePercent ?? 5);
          setChefNotes(existingRecipe.notes || "");
          setIngredients(
            (existingRecipe.ingredients || []).map((ing: RecipeIngredient) => {
              const stockRef = ing.stockItem;
              let sId = "";
              if (stockRef) {
                if (typeof stockRef === "string") {
                  sId = stockRef;
                } else if (typeof stockRef === "object" && stockRef._id) {
                  sId = stockRef._id;
                }
              }

              return {
                name: ing.name || "",
                quantityPerServing: ing.quantityPerServing || 0,
                unit: ing.unit || "kg",
                stockItemId: sId,
                notes: ing.notes || "",
              };
            })
          );
        } else {
          setRecipeId(null);
          setYieldServings(1);
          setDefaultWastagePercent(5);
          setChefNotes("");
          setIngredients([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recipe details");
      } finally {
        setLoading(false);
      }
    };

    void loadRecipeAndStock();
  }, [isOpen, foodItem, token, fetchEligibleStockItems]);

  if (!isOpen || !foodItem) return null;

  const handleAddIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      {
        name: "",
        quantityPerServing: 0.1,
        unit: "kg",
        stockItemId: "",
        notes: "",
      },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setIngredients((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      // When selecting a stock item, autofill name and unit from MongoDB record
      if (field === "stockItemId") {
        if (typeof value === "string" && value) {
          const matched = stockItems.find((s) => s._id === value);
          if (matched) {
            item.name = matched.name;
            if (matched.unit) item.unit = matched.unit;
          }
        }
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleSelectStockItem = (index: number, stockItem: StockItem) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        stockItemId: stockItem._id,
        name: stockItem.name,
        unit: stockItem.unit || updated[index].unit || "kg",
      };
      return updated;
    });
  };

  const handleUnlinkStockItem = (index: number) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        stockItemId: "",
      };
      return updated;
    });
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setSuccessMsg(null);

    // Validation 1: Ingredients existence
    if (ingredients.length === 0) {
      setError("Please add at least one item to the recipe.");
      return;
    }

    // Validation 2: Ingredients fields and positive quantities
    const seenStockIds = new Set<string>();
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      if (!ing.name.trim()) {
        setError(`Item #${i + 1} requires a name.`);
        return;
      }
      const qty = Number(ing.quantityPerServing);
      if (isNaN(qty) || qty <= 0) {
        setError(
          `Item "${ing.name || `#${i + 1}`}" quantity must be greater than zero.`
        );
        return;
      }
      if (!ing.unit.trim()) {
        setError(`Item "${ing.name}" requires a unit.`);
        return;
      }

      if (ing.stockItemId) {
        if (seenStockIds.has(ing.stockItemId)) {
          const dup = stockItems.find((s) => s._id === ing.stockItemId);
          setError(
            `"${dup?.name || ing.stockItemId}" is already added to this recipe.`
          );
          return;
        }
        seenStockIds.add(ing.stockItemId);
      }
    }

    try {
      setSaving(true);
      const payload = {
        foodItemId: foodItem._id,
        foodItemName: foodItem.name,
        category: foodItem.category,
        yieldServings: Math.max(1, Number(yieldServings) || 1),
        defaultWastagePercent: Math.max(0, Math.min(100, Number(defaultWastagePercent) || 0)),
        ingredients: ingredients.map((ing) => ({
          name: ing.name.trim(),
          quantityPerServing: Number(ing.quantityPerServing) || 0,
          unit: ing.unit.trim() || "kg",
          stockItem: ing.stockItemId ? ing.stockItemId : undefined,
          notes: ing.notes.trim(),
        })),
        notes: chefNotes.trim(),
      };

      const res = await upsertRecipe(payload, token);
      setSuccessMsg("Recipe saved successfully!");
      if (onRecipeSaved && res.data) {
        onRecipeSaved(res.data);
      }
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  // Set of already linked stock item IDs across rows to prevent duplicates in select options
  const linkedStockIds = new Set(
    ingredients.map((ing) => ing.stockItemId).filter(Boolean)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
              <ChefHat size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-900 tracking-wider">
                  {foodItem.category}
                </span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs font-semibold text-[#6B5B95]">
                  Recipe Details
                </span>
              </div>
              <h2 className="text-lg font-black text-[#29241f] leading-tight">
                {foodItem.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Modal Loader */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Loader2 size={32} className="animate-spin text-[#6B5B95]" />
            <p className="mt-3 text-xs font-semibold text-gray-500">
              Loading recipe details...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs">
            {/* Feedback Alerts */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-rose-800 font-semibold"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div
                role="status"
                className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 font-bold"
              >
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Live Kitchen Stock Banner */}
            <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-[#faf8f5] px-3.5 py-2 text-stone-700">
              <div className="flex items-center gap-2">
                <Package size={15} className="text-[#6B5B95]" />
                <span className="font-bold text-xs text-stone-800">
                  Store Stock:
                </span>
                {stockLoading ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                    <Loader2 size={12} className="animate-spin text-[#9a6c37]" />
                    Checking stock...
                  </span>
                ) : stockError ? (
                  <span className="text-[11px] font-semibold text-rose-600">
                    Warning: {stockError}
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    {stockItems.length} items available
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={fetchEligibleStockItems}
                disabled={stockLoading}
                title="Refresh stock"
                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={11} className={stockLoading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Servings & Wastage Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Number of Plates / Servings *
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={yieldServings}
                    onChange={(e) => setYieldServings(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-bold text-stone-900 outline-none focus:border-[#6B5B95] focus:ring-1 focus:ring-[#6B5B95]"
                  />
                  <span className="text-stone-400 text-[11px] shrink-0 font-medium">
                    plates
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-gray-400">
                  How many plates this recipe is prepared for.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Extra Wastage Margin (%)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    value={defaultWastagePercent}
                    onChange={(e) => setDefaultWastagePercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-bold text-stone-900 outline-none focus:border-[#6B5B95] focus:ring-1 focus:ring-[#6B5B95]"
                  />
                  <span className="text-stone-400 text-[11px] shrink-0 font-medium">
                    % extra
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-gray-400">
                  Extra margin for cleaning, cutting, and cooking loss.
                </p>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-[#29241f] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-[#6B5B95]" />
                    <span>Ingredients ({ingredients.length})</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Amounts needed for {yieldServings} {yieldServings === 1 ? "plate" : "plates"}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#6B5B95] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#594980] transition shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Item</span>
                </button>
              </div>

              {ingredients.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center text-gray-500">
                  <ChefHat size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="font-bold text-xs text-gray-700">
                    No items added yet for this dish.
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Click &quot;+ Add Item&quot; above to search and add ingredients from store stock.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-xs">
                  {ingredients.map((ing, idx) => {
                    const linkedStockDoc = ing.stockItemId
                      ? stockItems.find((s) => s._id === ing.stockItemId)
                      : null;

                    return (
                      <div key={idx} className="p-3 space-y-2 hover:bg-stone-50/50 transition">
                        <div className="grid grid-cols-12 gap-2.5 items-start">
                          {/* Unified Item Search Combobox */}
                          <div className="col-span-12 sm:col-span-7">
                            <StockIngredientCombobox
                              name={ing.name}
                              stockItemId={ing.stockItemId}
                              stockItems={stockItems}
                              usedStockIds={linkedStockIds}
                              onChangeName={(newName) =>
                                handleIngredientChange(idx, "name", newName)
                              }
                              onSelectStockItem={(selected) =>
                                handleSelectStockItem(idx, selected)
                              }
                              onUnlinkStockItem={() => handleUnlinkStockItem(idx)}
                            />
                          </div>

                          {/* Quantity */}
                          <div className="col-span-6 sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                              Quantity *
                            </label>
                            <input
                              type="number"
                              min="0.0001"
                              step="any"
                              required
                              value={ing.quantityPerServing}
                              onChange={(e) =>
                                handleIngredientChange(idx, "quantityPerServing", e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs font-black text-[#6B5B95] outline-none focus:border-[#6B5B95]"
                            />
                          </div>

                          {/* Unit */}
                          <div className="col-span-5 sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                              Unit *
                            </label>
                            <select
                              value={ing.unit}
                              onChange={(e) =>
                                handleIngredientChange(idx, "unit", e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold outline-none focus:border-[#6B5B95] cursor-pointer min-w-[70px]"
                            >
                              {COMMON_UNITS.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                              {linkedStockDoc?.unit &&
                                !COMMON_UNITS.includes(linkedStockDoc.unit) && (
                                  <option value={linkedStockDoc.unit}>
                                    {linkedStockDoc.unit}
                                  </option>
                                )}
                            </select>
                          </div>

                          {/* Remove row button */}
                          <div className="col-span-1 text-right pt-5">
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(idx)}
                              className="rounded-lg p-1 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Optional notes */}
                        <div>
                          <input
                            type="text"
                            placeholder="Notes (optional - e.g. chopped, fried, boiled)..."
                            value={ing.notes}
                            onChange={(e) =>
                              handleIngredientChange(idx, "notes", e.target.value)
                            }
                            className="w-full rounded-lg border border-stone-200 bg-stone-50/60 px-2.5 py-1.5 text-[11px] text-stone-700 outline-none focus:border-[#6B5B95] focus:bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cooking Instructions / Notes */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Cooking Instructions / Notes (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Cooking steps, masala mixing tips, boiling time, or special instructions..."
                value={chefNotes}
                onChange={(e) => setChefNotes(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-800 outline-none focus:border-[#6B5B95] focus:ring-1 focus:ring-[#6B5B95]"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 font-black text-white hover:bg-black transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-300" />
                    <span>Save Recipe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

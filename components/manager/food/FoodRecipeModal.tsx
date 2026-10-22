"use client";

import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  ChefHat,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { FoodItem } from "@/lib/food.api";
import {
  getRecipes,
  upsertRecipe,
  type RecipeItem,
  type RecipeIngredient,
} from "@/lib/department.api";
import { getStockItems } from "@/lib/stock.api";
import type { StockItem } from "@/types/stock";

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
];

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

  // Available stock items for optional warehouse linking
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    if (!isOpen || !foodItem || !token) return;

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const loadRecipeAndStock = async () => {
      try {
        const [recipeRes, stockRes] = await Promise.all([
          getRecipes({ search: foodItem.name }, token).catch(() => ({ data: [] })),
          getStockItems(token, { limit: 200 }).catch(() => ({ data: [] })),
        ]);

        const stockList = stockRes.data || [];
        setStockItems(stockList);

        const found = (recipeRes.data || []).find(
          (r: RecipeItem) =>
            (r.foodItem &&
              (typeof r.foodItem === "string"
                ? r.foodItem === foodItem._id
                : r.foodItem._id === foodItem._id)) ||
            r.foodItemName?.toLowerCase() === foodItem.name?.toLowerCase()
        );

        if (found) {
          setRecipeId(found._id);
          setYieldServings(found.yieldServings || 1);
          setDefaultWastagePercent(found.defaultWastagePercent ?? 5);
          setChefNotes(found.notes || "");
          setIngredients(
            (found.ingredients || []).map((ing: RecipeIngredient) => {
              const stockRef = ing.stockItem;
              const sId = stockRef
                ? typeof stockRef === "string"
                  ? stockRef
                  : (stockRef as { _id?: string })._id || ""
                : "";

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
  }, [isOpen, foodItem, token]);

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

      // If user selected a stock item, prefill the unit and name if empty
      if (field === "stockItemId" && typeof value === "string" && value) {
        const matched = stockItems.find((s) => s._id === value);
        if (matched) {
          if (!item.name.trim()) item.name = matched.name;
          if (matched.unit) item.unit = matched.unit;
        }
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setSuccessMsg(null);

    // Validate ingredients
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      if (!ing.name.trim()) {
        setError(`Ingredient #${i + 1} requires a valid name.`);
        return;
      }
      const qty = Number(ing.quantityPerServing);
      if (isNaN(qty) || qty < 0) {
        setError(`Ingredient "${ing.name}" has an invalid quantity.`);
        return;
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
      setSuccessMsg("Standard recipe formula saved successfully!");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <ChefHat size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-900">
                  {foodItem.category}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500 font-medium">Standardized Recipe</span>
              </div>
              <h2 className="text-base font-black text-[#29241f]">
                {foodItem.name} — Recipe Ingredients
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#9a6c37]" />
          </div>
        ) : (
          <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs">
            {/* Feedback Alerts */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-800 font-medium">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 font-bold">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Yield & Wastage Settings */}
            <div className="grid grid-cols-2 gap-3 bg-[#faf8f5] p-3 rounded-2xl border border-stone-200">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Recipe Yield Servings
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={yieldServings}
                    onChange={(e) => setYieldServings(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-bold outline-none focus:border-[#9a6c37]"
                  />
                  <span className="text-stone-400 text-[11px] shrink-0 font-medium">servings / batch</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Cooking Wastage Allowance (%)
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
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-bold outline-none focus:border-[#9a6c37]"
                  />
                  <span className="text-stone-400 text-[11px] shrink-0 font-medium">% buffer</span>
                </div>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-[#29241f] text-xs uppercase tracking-wider">
                    Ingredients List ({ingredients.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Quantities specified per {yieldServings} {yieldServings === 1 ? "serving" : "servings"}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Ingredient</span>
                </button>
              </div>

              {ingredients.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-400">
                  <p className="font-semibold text-xs">No ingredients configured yet for this dish.</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Click &quot;+ Add Ingredient&quot; above to add milk, rice, chicken, vegetables, or spices.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden bg-white">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="p-3 space-y-2 hover:bg-gray-50/50">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Name */}
                        <div className="col-span-5 sm:col-span-4">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">
                            Ingredient Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Basmati Rice"
                            value={ing.name}
                            onChange={(e) =>
                              handleIngredientChange(idx, "name", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 p-1.5 text-xs font-bold outline-none focus:border-[#9a6c37]"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="col-span-3 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">
                            Qty / Serving *
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
                            className="w-full rounded-lg border border-gray-200 p-1.5 text-xs font-black text-[#9a6c37] outline-none focus:border-[#9a6c37]"
                          />
                        </div>

                        {/* Unit */}
                        <div className="col-span-3 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">
                            Unit
                          </label>
                          <select
                            value={ing.unit}
                            onChange={(e) =>
                              handleIngredientChange(idx, "unit", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white p-1.5 text-xs font-semibold outline-none focus:border-[#9a6c37]"
                          >
                            {COMMON_UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Linked Warehouse Stock Item */}
                        <div className="col-span-11 sm:col-span-3">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">
                            Stock Mapping
                          </label>
                          <select
                            value={ing.stockItemId}
                            onChange={(e) =>
                              handleIngredientChange(idx, "stockItemId", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white p-1.5 text-[11px] font-medium outline-none focus:border-[#9a6c37]"
                          >
                            <option value="">Auto-match by name</option>
                            {stockItems.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name} ({s.availableQuantity} {s.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Remove */}
                        <div className="col-span-1 text-right pt-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(idx)}
                            className="text-gray-300 hover:text-rose-500 p-1 transition cursor-pointer"
                            title="Remove ingredient"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Notes / preparation instruction */}
                      <div>
                        <input
                          type="text"
                          placeholder="Preparation notes (e.g. finely chopped, soak overnight)..."
                          value={ing.notes}
                          onChange={(e) =>
                            handleIngredientChange(idx, "notes", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-100 bg-[#faf8f5] px-2 py-1 text-[11px] text-gray-600 outline-none focus:border-[#9a6c37]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chef Preparation Notes */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Chef Preparation Instructions / Special Notes
              </label>
              <textarea
                rows={2}
                placeholder="Step-by-step preparation guidelines, allergy warnings, or cooking temperatures..."
                value={chefNotes}
                onChange={(e) => setChefNotes(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2 text-xs outline-none focus:border-[#9a6c37]"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241f] px-5 py-2 font-black text-white hover:bg-black transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                <span>Save Recipe Formula</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

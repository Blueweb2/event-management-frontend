"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Utensils,
  Check,
  Plus,
  Minus,
  Search,
  Sparkles,
  AlertCircle,
  ChefHat,
  Receipt,
  Info,
} from "lucide-react";
import type { BookingFormData } from "../types";
import {
  type FoodItem,
  type FoodCategory,
  type DietaryType,
  type SelectedFoodItemSnapshot,
  getFoodItems,
  getFoodImageUrl,
} from "@/lib/food.api";

interface FoodMenuStepProps {
  formData: BookingFormData;
  updateField: <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K]
  ) => void;
}

const CATEGORIES: FoodCategory[] = [
  "Welcome Drinks",
  "Starters / Appetizers",
  "Main Course",
  "Breads & Rice",
  "Desserts & Sweets",
  "Live Counters",
  "Beverages",
  "Salads & Soups",
];

export default function FoodMenuStep({
  formData,
  updateField,
}: FoodMenuStepProps) {
  const [foodCatalog, setFoodCatalog] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] =
    useState<FoodCategory>("Starters / Appetizers");
  const [dietaryFilter, setDietaryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const currentMenu = formData.foodMenu || {
    included: true,
    servingType: "FIXED",
    ratePerGuest: 0,
    totalFoodAmount: 0,
    notes: "",
    items: [],
  };

  // Load Catalog
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await getFoodItems({ active: true });
        setFoodCatalog(items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load food menu catalog."
        );
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  // Update Food Menu in Form Data
  const updateFoodMenu = (updates: Partial<typeof currentMenu>) => {
    const updated = {
      ...currentMenu,
      ...updates,
    };

    // Food pricing is based on selected quantities, not guest count.
    if (updated.included) {
      updated.totalFoodAmount = updated.items.reduce(
        (total, item) =>
          total + Number(item.rate || 0) * Number(item.quantity || 0),
        0,
      );
    } else {
      updated.totalFoodAmount = 0;
    }

    updateField("foodMenu", updated);
  };

  // Toggle item selection
  const handleToggleItem = (item: FoodItem) => {
    const exists = currentMenu.items.some(
      (i) => i.foodItemId === item._id || i.name === item.name
    );

    let nextItems: SelectedFoodItemSnapshot[];
    if (exists) {
      nextItems = currentMenu.items.filter(
        (i) => i.foodItemId !== item._id && i.name !== item.name
      );
    } else {
      nextItems = [
        ...currentMenu.items,
        {
          foodItemId: item._id,
          name: item.name,
          category: item.category,
          dietary: item.dietary,
          rate: item.defaultRate,
          quantity: 1,
          amount: item.defaultRate,
        },
      ];
    }

    updateFoodMenu({ items: nextItems });
  };

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    return foodCatalog.filter((item) => {
      const matchCat = item.category === activeCategory;
      const matchDiet =
        dietaryFilter === "all" || item.dietary === dietaryFilter;
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());

      return matchCat && matchDiet && matchSearch;
    });
  }, [foodCatalog, activeCategory, dietaryFilter, search]);

  // Selected Count per category
  const selectedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    currentMenu.items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [currentMenu.items]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 rounded-3xl border border-[#e8e1d8] bg-white p-5 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#29241f] text-white">
            <Utensils size={14} className="text-[#d8a86c]" />
          </span>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9A7B4F]">
            Step 3 • Food & Catering Menu
          </p>
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#29241f]">
          Design Your Event Dining Experience
        </h2>
        <p className="text-xs sm:text-sm text-[#756d64]">
          Select appetizers, main course delicacies, live counters, and beverages.
        </p>
      </div>

      {/* Include Catering Toggle Card */}
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-[#e8e1d8] bg-white p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#faf6f0] text-[#9A7B4F]">
            <ChefHat size={22} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#29241f]">
              Include Food & Catering Services
            </h3>
            <p className="text-[11px] sm:text-xs text-[#756d64]">
              {currentMenu.included
                ? "Dishes will be included in the total estimate."
                : "Skip food catering for this event proposal."}
            </p>
          </div>
        </div>

        <label className="relative inline-flex cursor-pointer items-center shrink-0">
          <input
            type="checkbox"
            checked={currentMenu.included}
            onChange={(e) => updateFoodMenu({ included: e.target.checked })}
            className="peer sr-only"
          />
          <div className="peer h-7 w-12 rounded-full bg-gray-200 after:absolute after:left-[3px] after:top-[3px] after:h-5.5 after:w-5.5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-[#29241f] peer-checked:after:translate-x-5 peer-focus:outline-none" />
        </label>
      </div>

      {/* Main Content when Catering is Included */}
      {currentMenu.included ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Catering Total Banner */}
          <div className="rounded-3xl border border-[#e8e1d8] bg-gradient-to-br from-[#faf8f5] to-[#f4ecdc] p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-[#9A7B4F]" />
                  <h4 className="text-xs sm:text-sm font-bold text-[#29241f]">
                    Food Catering Total
                  </h4>
                </div>
                <p className="mt-0.5 text-xs text-[#756d64]">
                  Total calculated from dish quantities and unit plate rates.
                </p>
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end rounded-2xl bg-white/90 p-3 sm:p-2.5 border border-[#e8dfd2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d847b]">
                  Catering Total:
                </span>
                <span className="text-base sm:text-lg font-black text-[#29241f]">
                  ₹{currentMenu.totalFoodAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="mt-3 border-t border-[#e8e1d8] pt-3">
              <label className="block text-xs font-semibold text-[#29241f]">
                Dietary & Kitchen Instructions
              </label>
              <input
                type="text"
                value={currentMenu.notes || ""}
                onChange={(e) => updateFoodMenu({ notes: e.target.value })}
                placeholder="e.g., 25 Jain meals, welcome drinks on entry, live pasta counter..."
                className="mt-1 w-full rounded-xl border border-[#d8cfc4] bg-white px-3.5 py-2 text-xs text-[#29241f] placeholder-gray-400 focus:border-[#9A7B4F] focus:outline-none focus:ring-1 focus:ring-[#9A7B4F]"
              />
            </div>
          </div>

          {/* Search and Dietary Filter */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter dishes in this course..."
                className="w-full rounded-2xl border border-[#d8cfc4] bg-white py-2.5 pl-10 pr-3 text-xs text-[#29241f] placeholder-gray-400 focus:border-[#9A7B4F] focus:outline-none focus:ring-1 focus:ring-[#9A7B4F]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setDietaryFilter("all")}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer shrink-0 ${
                  dietaryFilter === "all"
                    ? "bg-[#29241f] text-white"
                    : "bg-white border border-[#e8e1d8] text-gray-600 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter("veg")}
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer shrink-0 ${
                  dietaryFilter === "veg"
                    ? "bg-emerald-700 text-white"
                    : "bg-white border border-[#e8e1d8] text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                🟢 Veg
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter("non-veg")}
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer shrink-0 ${
                  dietaryFilter === "non-veg"
                    ? "bg-rose-700 text-white"
                    : "bg-white border border-[#e8e1d8] text-rose-700 hover:bg-rose-50"
                }`}
              >
                🔴 Non-Veg
              </button>
            </div>
          </div>

          {/* Category Tabs - Touch Scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const selectedInCat = selectedCounts[cat] || 0;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#29241f] text-white shadow-xs"
                      : "border border-[#e8e1d8] bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{cat}</span>
                  {selectedInCat > 0 && (
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-[#d8a86c] text-[#29241f]"
                          : "bg-[#29241f] text-white"
                      }`}
                    >
                      {selectedInCat}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Catalog Grid */}
          {filteredCatalog.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d8cfc4] bg-white p-8 text-center text-xs text-gray-500">
              No dishes found in this category matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCatalog.map((item) => {
                const isSelected = currentMenu.items.some(
                  (i) => i.foodItemId === item._id || i.name === item.name
                );

                return (
                  <div
                    key={item._id}
                    onClick={() => handleToggleItem(item)}
                    className={`group relative flex cursor-pointer flex-col justify-between rounded-3xl border p-4 shadow-xs transition-all select-none ${
                      isSelected
                        ? "border-[#9A7B4F] bg-[#faf6f0] ring-1 ring-[#9A7B4F]"
                        : "border-[#e8e1d8] bg-white hover:border-[#9A7B4F]/40 hover:bg-[#fbfaf8]"
                    }`}
                  >
                    <div>
                      {item.imageUrl ? (
                        <img
                          src={getFoodImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="mb-3 h-36 sm:h-44 w-full rounded-2xl object-cover"
                        />
                      ) : null}

                      {/* Top Row: Dietary + Name + Selection Checkbox */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                              item.dietary === "veg"
                                ? "border-green-600 bg-green-50 text-[8px] text-green-600"
                                : item.dietary === "non-veg"
                                ? "border-red-600 bg-red-50 text-[8px] text-red-600"
                                : "border-emerald-600 bg-emerald-50 text-[8px] text-emerald-600"
                            }`}
                          >
                            ●
                          </span>
                          <h4 className="text-sm font-bold text-[#29241f] leading-snug">
                            {item.name}
                          </h4>
                        </div>

                        {/* Checkbox button */}
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-gray-300 bg-white text-transparent group-hover:border-gray-400"
                          }`}
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="mt-1.5 text-xs text-[#756d64] line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Reference Rate */}
                    <div className="mt-3.5 flex items-center justify-between border-t border-[#eee7dc] pt-2.5 text-xs">
                      <span className="text-[10px] text-gray-500 font-medium">
                        ₹{item.defaultRate}/plate
                      </span>

                      {isSelected ? (
                        (() => {
                          const selectedItem = currentMenu.items.find(
                            (selected) =>
                              selected.foodItemId === item._id ||
                              selected.name === item.name,
                          );

                          if (!selectedItem) return null;

                          const quantity = Number(selectedItem.quantity || 1);
                          const amount = Number(selectedItem.rate || 0) * quantity;

                          return (
                            <div
                              className="flex items-center gap-2.5"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="flex items-center overflow-hidden rounded-xl border border-[#d8cfc4] bg-[#faf8f5] shadow-xs">
                                <button
                                  type="button"
                                  aria-label={`Decrease ${item.name} quantity`}
                                  disabled={quantity <= 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextQty = Math.max(1, quantity - 1);
                                    updateFoodMenu({
                                      items: currentMenu.items.map((food) =>
                                        food.foodItemId === item._id || food.name === item.name
                                          ? {
                                              ...food,
                                              quantity: nextQty,
                                              amount: Number(food.rate || 0) * nextQty,
                                            }
                                          : food,
                                      ),
                                    });
                                  }}
                                  className="flex h-8 w-8 items-center justify-center bg-white text-[#5c544a] hover:bg-[#eee6d8] hover:text-[#29241f] active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                  <Minus size={13} strokeWidth={2.5} />
                                </button>

                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={quantity}
                                  onClick={(e) => e.stopPropagation()}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, "");
                                    const newQty = raw === "" ? 1 : Math.max(1, parseInt(raw, 10));
                                    updateFoodMenu({
                                      items: currentMenu.items.map((food) =>
                                        food.foodItemId === item._id || food.name === item.name
                                          ? {
                                              ...food,
                                              quantity: newQty,
                                              amount: Number(food.rate || 0) * newQty,
                                            }
                                          : food,
                                      ),
                                    });
                                  }}
                                  className="w-10 bg-transparent text-center text-xs font-black text-[#29241f] focus:outline-none"
                                />

                                <button
                                  type="button"
                                  aria-label={`Increase ${item.name} quantity`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextQty = quantity + 1;
                                    updateFoodMenu({
                                      items: currentMenu.items.map((food) =>
                                        food.foodItemId === item._id || food.name === item.name
                                          ? {
                                              ...food,
                                              quantity: nextQty,
                                              amount: Number(food.rate || 0) * nextQty,
                                            }
                                          : food,
                                      ),
                                    });
                                  }}
                                  className="flex h-8 w-8 items-center justify-center bg-white text-[#5c544a] hover:bg-[#eee6d8] hover:text-[#29241f] active:scale-90 transition-all"
                                >
                                  <Plus size={13} strokeWidth={2.5} />
                                </button>
                              </div>

                              <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-[#29241f]">
                                  ₹{amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-[11px] font-bold text-[#9A7B4F]">
                          + Select Dish
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* When Food is Skipped */
        <div className="rounded-3xl border border-dashed border-[#d8cfc4] bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <ChefHat size={22} />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-gray-900">
            Food Catering is Not Included
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            No catering items or food charges will be added to this estimate. Click &quot;Include&quot; above anytime to add a custom food menu.
          </p>
        </div>
      )}
    </div>
  );
}

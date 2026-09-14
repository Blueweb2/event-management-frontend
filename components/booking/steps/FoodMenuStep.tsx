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

  const guestCount = Math.max(Number(formData.guests) || 1, 1);
  const currentMenu = formData.foodMenu || {
    included: true,
    servingType: "PER_GUEST",
    ratePerGuest: 500,
    totalFoodAmount: 500 * guestCount,
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

    // Calculate total amount
    if (updated.included) {
      const rate = Number(updated.ratePerGuest || 0);
      updated.totalFoodAmount = Math.max(0, rate * guestCount);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--sage)]">
            Step 3
          </p>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs font-semibold text-[#8C7A55]">
            Catering & Menu
          </span>
        </div>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--sage-dark)] sm:text-3xl">
          Food & Customized Menu
        </h2>

        <p className="mt-1 text-sm text-[var(--taupe)]">
          Select customized courses for the client and configure the per-guest catering rate.
        </p>
      </div>

      {/* Include Catering Toggle Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6B5B95]/10 text-[#6B5B95]">
            <ChefHat size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Include Food & Catering Services
            </h3>
            <p className="text-xs text-gray-500">
              Provide a customized multi-course meal package for this event.
            </p>
          </div>
        </div>

        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={currentMenu.included}
            onChange={(e) => updateFoodMenu({ included: e.target.checked })}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#6B5B95] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
          <span className="ml-3 text-xs font-semibold text-gray-700">
            {currentMenu.included ? "Included" : "Skip Food"}
          </span>
        </label>
      </div>

      {/* Main Content when Catering is Included */}
      {currentMenu.included ? (
        <div className="space-y-6">
          {/* Rate Customizer Banner */}
          <div className="rounded-2xl border border-[#d7c4aa] bg-gradient-to-br from-[#fbf8f2] to-[#f5ede0] p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-[#8C7A55]" />
                  <h4 className="text-sm font-bold text-gray-900">
                    Client Catering Rate Configuration
                  </h4>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Enter the agreed per-guest plate rate for this customer's customized menu.
                </p>
              </div>

              {/* Rate Input + Calculation */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Rate / Guest (₹)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={currentMenu.ratePerGuest}
                      onChange={(e) =>
                        updateFoodMenu({
                          ratePerGuest: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="w-32 rounded-xl border border-[#c4b39b] bg-white pl-7 pr-3 py-1.5 text-sm font-bold text-gray-900 shadow-sm focus:border-[#6B5B95] focus:outline-none focus:ring-1 focus:ring-[#6B5B95]"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Total Catering Charge
                  </span>
                  <div className="mt-1 rounded-xl bg-white/80 border border-[#c4b39b]/60 px-3 py-1.5 text-sm font-bold text-[#6B5B95]">
                    ₹{currentMenu.totalFoodAmount.toLocaleString("en-IN")}
                    <span className="text-[10px] font-normal text-gray-500">
                      {" "}
                      ({guestCount} guests)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="mt-4 border-t border-[#e5d8c5] pt-3">
              <label className="block text-[11px] font-semibold text-gray-700">
                Dietary & Catering Notes for Kitchen Team
              </label>
              <input
                type="text"
                value={currentMenu.notes || ""}
                onChange={(e) => updateFoodMenu({ notes: e.target.value })}
                placeholder="e.g., 25 Jain meals required, serve welcome drinks on arrival, live pasta counter..."
                className="mt-1 w-full rounded-xl border border-[#c4b39b] bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:outline-none focus:ring-1 focus:ring-[#6B5B95]"
              />
            </div>
          </div>

          {/* Selected Menu Overview Ribbon */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 font-medium text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6B5B95] text-[11px] font-bold text-white">
                {currentMenu.items.length}
              </span>
              <span>Dishes selected in menu</span>
            </div>

            {currentMenu.items.length > 0 && (
              <button
                type="button"
                onClick={() => updateFoodMenu({ items: [] })}
                className="text-xs text-red-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search and Dietary Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:outline-none focus:ring-1 focus:ring-[#6B5B95]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDietaryFilter("all")}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  dietaryFilter === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter("veg")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  dietaryFilter === "veg"
                    ? "bg-green-600 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                🟢 Veg
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter("non-veg")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  dietaryFilter === "non-veg"
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                🔴 Non-Veg
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const selectedInCat = selectedCounts[cat] || 0;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#6B5B95] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{cat}</span>
                  {selectedInCat > 0 && (
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white text-[#6B5B95]"
                          : "bg-[#6B5B95] text-white"
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
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-xs text-gray-500">
              No dishes found in this category. Use manager panel to add more items.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCatalog.map((item) => {
                const isSelected = currentMenu.items.some(
                  (i) => i.foodItemId === item._id || i.name === item.name
                );

                return (
                  <div
                    key={item._id}
                    onClick={() => handleToggleItem(item)}
                    className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all select-none ${
                      isSelected
                        ? "border-[#6B5B95] bg-[#6B5B95]/5 ring-1 ring-[#6B5B95]"
                        : "border-[#e8e1d8] bg-white hover:border-[#6B5B95]/40 hover:bg-[#fbfaf8]"
                    }`}
                  >
                    <div>
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
                          <h4 className="text-sm font-bold text-gray-900 leading-snug">
                            {item.name}
                          </h4>
                        </div>

                        {/* Checkbox button */}
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                            isSelected
                              ? "border-[#6B5B95] bg-[#6B5B95] text-white"
                              : "border-gray-300 bg-white text-transparent group-hover:border-gray-400"
                          }`}
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Reference Rate */}
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                      <span className="text-[10px] text-gray-400">
                        Base: ₹{item.defaultRate}/plate
                      </span>
                      {isSelected ? (
                        <span className="text-[11px] font-bold text-[#6B5B95]">
                          ✓ Selected
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-400 group-hover:text-gray-700">
                          + Add to Menu
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
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <ChefHat size={22} />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-gray-900">
            Food Catering is Not Included
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            No catering items or food charges will be added to this estimate. Click "Include" above anytime to add a custom food menu.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  Utensils,
  Sparkles,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  type FoodItem,
  type FoodCategory,
  deleteFoodItem,
  updateFoodItem,
  getFoodImageUrl,
} from "@/lib/food.api";

interface FoodListProps {
  items: FoodItem[];
  onEdit: (item: FoodItem) => void;
  onItemUpdated: (item: FoodItem) => void;
  onItemDeleted: (id: string) => void;
  onAddNew: () => void;
}

const CATEGORIES = [
  "All",
  "Welcome Drinks",
  "Starters / Appetizers",
  "Main Course",
  "Breads & Rice",
  "Desserts & Sweets",
  "Live Counters",
  "Beverages",
  "Salads & Soups",
];

export default function FoodList({
  items,
  onEdit,
  onItemUpdated,
  onItemDeleted,
  onAddNew,
}: FoodListProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDietary, setSelectedDietary] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<FoodItem | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesDietary =
      selectedDietary === "all" || item.dietary === selectedDietary;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesDietary && matchesSearch;
  });

  const handleToggleActive = async (item: FoodItem) => {
    try {
      const updated = await updateFoodItem(item._id, {
        active: !item.active,
      });
      onItemUpdated(updated);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const item = items.find((current) => current._id === id);
    if (!item) return;

    setDeletingItem(item);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    setDeletingId(deletingItem._id);
    try {
      await deleteFoodItem(deletingItem._id);
      onItemDeleted(deletingItem._id);
      setDeletingItem(null);
    } catch (err) {
      console.error("Failed to delete food item:", err);
      alert(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  // Group items by category if "All" is selected
  const categoriesPresent = Array.from(
    new Set(filteredItems.map((item) => item.category))
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes by name or ingredients..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B5B95]"
          />
        </div>

        {/* Dietary Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedDietary("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedDietary === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => setSelectedDietary("veg")}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedDietary === "veg"
                ? "bg-green-600 text-white"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            🟢 Veg
          </button>
          <button
            type="button"
            onClick={() => setSelectedDietary("non-veg")}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedDietary === "non-veg"
                ? "bg-red-600 text-white"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            🔴 Non-Veg
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count =
            cat === "All"
              ? items.length
              : items.filter((i) => i.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-[#6B5B95] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Food Items Display */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <Utensils size={24} />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No food items found
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {searchQuery
              ? "No dishes match your search criteria."
              : "Start by adding dishes to this category."}
          </p>
          <button
            type="button"
            onClick={onAddNew}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
          >
            <Plus size={15} />
            Add First Dish
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categoriesPresent.map((category) => {
            const categoryItems = filteredItems.filter(
              (item) => item.category === category
            );

            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B5B95]">
                    {category} ({categoryItems.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryItems.map((item) => (
                    <div
                      key={item._id}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${
                        item.active
                          ? "border-[#e8e1d8] bg-white hover:border-[#6B5B95]/40"
                          : "border-gray-200 bg-gray-50/70 opacity-70"
                      }`}
                    >
                      <div>
                        {item.imageUrl ? (
                          <img
                            src={getFoodImageUrl(item.imageUrl)}
                            alt={item.name}
                            className="mb-3 h-72 w-full rounded-xl object-cover"
                          />
                        ) : null}
                        {/* Top Meta */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {/* Dietary Dot */}
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                                item.dietary === "veg"
                                  ? "border-green-600 bg-green-50 text-[8px] text-green-600"
                                  : item.dietary === "non-veg"
                                  ? "border-red-600 bg-red-50 text-[8px] text-red-600"
                                  : item.dietary === "vegan"
                                  ? "border-emerald-600 bg-emerald-50 text-[8px] text-emerald-600"
                                  : "border-yellow-600 bg-yellow-50 text-[8px] text-yellow-600"
                              }`}
                              title={item.dietary.toUpperCase()}
                            >
                              ●
                            </span>

                            <h4 className="text-sm font-bold text-gray-900 leading-snug">
                              {item.name}
                            </h4>
                          </div>

                          {/* Popular badge */}
                          {item.isPopular && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              <Sparkles size={10} />
                              Special
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {item.description && (
                          <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Price & Controls */}
                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                            Base Rate
                          </p>
                          <p className="text-base font-bold text-[#6B5B95]">
                            ₹{item.defaultRate}
                            <span className="text-[11px] font-normal text-gray-400">
                              {" "}
                              / plate
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(item)}
                            title={
                              item.active
                                ? "Click to deactivate"
                                : "Click to activate"
                            }
                            className={`rounded-lg p-1.5 transition ${
                              item.active
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-400 hover:bg-gray-200"
                            }`}
                          >
                            {item.active ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            title="Edit dish"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id, item.name)}
                            disabled={deletingId === item._id}
                            title="Delete dish"
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => void confirmDelete()}
        title="Remove menu item?"
        description={
          deletingItem
            ? `Are you sure you want to remove "${deletingItem.name}" from the menu?`
            : undefined
        }
        confirmText="Remove item"
        loading={Boolean(deletingId)}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Utensils, ImagePlus } from "lucide-react";
import {
  type FoodItem,
  type FoodCategory,
  type DietaryType,
  createFoodItem,
  updateFoodItem,
  uploadFoodImage,
} from "@/lib/food.api";

interface FoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: FoodItem) => void;
  editingItem?: FoodItem | null;
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

export default function FoodModal({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
}: FoodModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<FoodCategory>("Starters / Appetizers");
  const [dietary, setDietary] = useState<DietaryType>("veg");
  const [defaultRate, setDefaultRate] = useState("150");
  const [description, setDescription] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [active, setActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || "");
      setCategory(editingItem.category || "Starters / Appetizers");
      setDietary(editingItem.dietary || "veg");
      setDefaultRate(String(editingItem.defaultRate ?? 0));
      setDescription(editingItem.description || "");
      setIsPopular(Boolean(editingItem.isPopular));
      setActive(editingItem.active !== undefined ? editingItem.active : true);
      setImageUrl(editingItem.imageUrl || "");
      setImageFile(null);
    } else {
      setName("");
      setCategory("Starters / Appetizers");
      setDietary("veg");
      setDefaultRate("150");
      setDescription("");
      setIsPopular(false);
      setActive(true);
      setImageUrl("");
      setImageFile(null);
    }
    setError("");
  }, [editingItem, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter the food item name.");
      return;
    }

    const rate = Number(defaultRate);
    if (!Number.isFinite(rate) || rate < 0) {
      setError("Please enter a valid rate (₹).");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const savedImageUrl = imageFile ? await uploadFoodImage(imageFile) : imageUrl;
      if (editingItem) {
        const updated = await updateFoodItem(editingItem._id, {
          name: name.trim(),
          category,
          dietary,
          defaultRate: rate,
          description: description.trim(),
          isPopular,
          active,
          imageUrl: savedImageUrl,
        });
        onSuccess(updated);
      } else {
        const created = await createFoodItem({
          name: name.trim(),
          category,
          dietary,
          defaultRate: rate,
          description: description.trim(),
          isPopular,
          active,
          imageUrl: savedImageUrl,
        });
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save food item. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className="relative flex w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl transition-all overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="flex sm:hidden justify-center pt-2.5 pb-1 bg-white">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-5 sm:px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6B5B95]/10 text-[#6B5B95]">
              <Utensils size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {editingItem ? "Edit Food Item" : "Add New Food Item"}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                Configure dish details and standard reference rate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition shrink-0 active:scale-95"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="food-item-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 overscroll-contain"
        >
          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 animate-in fade-in">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Paneer Tikka Angara"
              className="mt-1.5 h-11 w-full rounded-xl border border-gray-300 px-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/20"
              required
            />
          </div>

          {/* Category & Dietary */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 focus:border-[#6B5B95] focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/20"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Dietary Type <span className="text-red-500">*</span>
              </label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value as DietaryType)}
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 focus:border-[#6B5B95] focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/20"
              >
                <option value="veg">🟢 Pure Vegetarian</option>
                <option value="non-veg">🔴 Non-Vegetarian</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="egg">🟡 Contains Egg</option>
              </select>
            </div>
          </div>

          {/* Default Rate */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Default Rate (₹ / plate or unit) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-bold text-gray-400">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={defaultRate}
                onChange={(e) => setDefaultRate(e.target.value)}
                placeholder="150"
                className="h-11 w-full rounded-xl border border-gray-300 pl-8 pr-3.5 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/20"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Standard reference price. Can be adjusted per customer on event booking.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Description / Ingredients
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Tandoor roasted cottage cheese in spicy marinade..."
              className="mt-1.5 w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/20"
            />
          </div>

          {/* Food Image */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Food Image
            </label>
            <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-gray-300 p-3 transition hover:border-[#6B5B95] hover:bg-gray-50/50">
              {imageFile || imageUrl ? (
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "http://localhost:5000"}${imageUrl}`}
                  alt="Food preview"
                  className="h-14 w-14 rounded-xl object-cover border border-gray-200"
                />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  <ImagePlus size={22} />
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800">
                  {imageFile ? imageFile.name : imageUrl ? "Change Photo" : "Upload Photo"}
                </p>
                <p className="text-[11px] text-gray-500">
                  JPG, PNG, WEBP, or GIF up to 5 MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <label className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#6B5B95] focus:ring-[#6B5B95]"
              />
              <span>⭐ Chef Special / Popular</span>
            </label>

            <label className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#6B5B95] focus:ring-[#6B5B95]"
              />
              <span>✓ Active & Available</span>
            </label>
          </div>
        </form>

        {/* Sticky Actions Footer - Always visible and thumb-friendly on mobile */}
        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-gray-100 bg-white/95 px-5 sm:px-6 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] backdrop-blur-xs shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm sm:text-xs font-bold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="food-item-form"
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 text-sm sm:text-xs font-bold text-white shadow-sm transition hover:bg-black active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : editingItem ? (
              "Save Changes"
            ) : (
              "Add to Menu"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

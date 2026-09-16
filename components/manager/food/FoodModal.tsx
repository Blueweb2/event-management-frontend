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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B5B95]/10 text-[#6B5B95]">
              <Utensils size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? "Edit Food Item" : "Add New Food Item"}
              </h2>
              <p className="text-xs text-gray-500">
                Configure dish details and standard reference rate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Paneer Tikka Angara"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:outline-none focus:ring-1 focus:ring-[#6B5B95]"
              required
            />
          </div>

          {/* Category & Dietary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#6B5B95] focus:outline-none focus:ring-1 focus:ring-[#6B5B95]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Dietary Type <span className="text-red-500">*</span>
              </label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value as DietaryType)}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#6B5B95] focus:outline-none focus:ring-1 focus:ring-[#6B5B95]"
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
            <label className="block text-xs font-semibold text-gray-700">
              Default Rate (₹ / plate or unit) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={defaultRate}
                onChange={(e) => setDefaultRate(e.target.value)}
                placeholder="150"
                className="w-full rounded-xl border border-gray-300 pl-8 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:outline-none focus:ring-1 focus:ring-[#6B5B95]"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Used as base reference. Managers can customize rates per customer during booking.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Description / Ingredients
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Tandoor roasted cottage cheese in spicy marinade..."
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:outline-none focus:ring-1 focus:ring-[#6B5B95]"
            />
          </div>

          {/* Food Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Food Image
            </label>
            <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 p-3 hover:border-[#6B5B95]">
              {imageFile || imageUrl ? (
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "http://localhost:5000"}${imageUrl}`}
                  alt="Food preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                  <ImagePlus size={22} />
                </span>
              )}
              <span className="text-xs text-gray-500">
                Choose a JPG, PNG, WEBP, or GIF up to 5 MB.
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#6B5B95] focus:ring-[#6B5B95]"
              />
              Mark as Popular / Chef Special
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#6B5B95] focus:ring-[#6B5B95]"
              />
              Active & Available
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : editingItem ? (
                "Save Changes"
              ) : (
                "Add to Menu"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

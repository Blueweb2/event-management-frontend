"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";

import {
  foodCategories,
  type FoodCategory,
  type FoodItem,
  type FoodType,
} from "./constants";

interface AddFoodModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: FoodItem) => void;
  editingItem?: FoodItem | null;
}

const emptyForm: Omit<FoodItem, "id"> = {
  name: "",
  category: "Starters",
  type: "Veg",
  price: 0,
  description: "",
  available: true,
  popular: false,
};

export default function AddFoodModal({
  open,
  onClose,
  onSave,
  editingItem,
}: AddFoodModalProps) {
  const [form, setForm] =
    useState<Omit<FoodItem, "id">>(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (editingItem) {
      const { id, ...rest } = editingItem;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [open, editingItem]);

  if (!open) return null;

  const updateField = <K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    const item: FoodItem = {
      id: editingItem?.id ?? `FOOD-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      type: form.type,
      price: Number(form.price),
      description: form.description.trim(),
      available: form.available,
      popular: form.popular,
    };

    onSave(item);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#29241f]/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eee8e1] bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#29241f]">
              {editingItem ? "Edit Food Item" : "Add Food Item"}
            </h2>

            <p className="mt-1 text-xs text-[#9b938a]">
              {editingItem
                ? "Update menu item details."
                : "Add a new item to your menu."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#8d847b] transition hover:bg-[#f7f3ee] hover:text-[#29241f]"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {/* Name */}
          <div>
            <label
              htmlFor="food-name"
              className="mb-2 block text-xs font-semibold text-[#403a34]"
            >
              Food Name
            </label>

            <input
              id="food-name"
              type="text"
              value={form.name}
              onChange={(e) =>
                updateField("name", e.target.value)
              }
              placeholder="e.g. Paneer Tikka"
              required
              className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>

          {/* Category + Type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="food-category"
                className="mb-2 block text-xs font-semibold text-[#403a34]"
              >
                Category
              </label>

              <select
                id="food-category"
                value={form.category}
                onChange={(e) =>
                  updateField(
                    "category",
                    e.target.value as FoodCategory
                  )
                }
                className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
              >
                {foodCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="food-type"
                className="mb-2 block text-xs font-semibold text-[#403a34]"
              >
                Food Type
              </label>

              <select
                id="food-type"
                value={form.type}
                onChange={(e) =>
                  updateField(
                    "type",
                    e.target.value as FoodType
                  )
                }
                className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="food-price"
              className="mb-2 block text-xs font-semibold text-[#403a34]"
            >
              Price
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#8d847b]">
                ₹
              </span>

              <input
                id="food-price"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) =>
                  updateField(
                    "price",
                    Number(e.target.value)
                  )
                }
                className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] pl-8 pr-3 text-sm text-[#29241f] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="food-description"
              className="mb-2 block text-xs font-semibold text-[#403a34]"
            >
              Description
            </label>

            <textarea
              id="food-description"
              value={form.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              placeholder="Short description of the food item..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 py-3 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 rounded-xl border border-[#eee8e1] bg-[#fdfbf8] p-4">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#403a34]">
                  Available
                </p>
                <p className="mt-0.5 text-xs text-[#9b938a]">
                  Customers can select this item.
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  updateField("available", e.target.checked)
                }
                className="h-4 w-4 accent-[#b8894b]"
              />
            </label>

            <div className="h-px bg-[#eee8e1]" />

            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#403a34]">
                  Popular Item
                </p>
                <p className="mt-0.5 text-xs text-[#9b938a]">
                  Highlight this item as popular.
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.popular}
                onChange={(e) =>
                  updateField("popular", e.target.checked)
                }
                className="h-4 w-4 accent-[#b8894b]"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-[#e3dbd2] px-5 text-sm font-semibold text-[#756d64] transition hover:bg-[#f8f4ee] hover:text-[#29241f]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#b8894b] px-5 text-sm font-semibold text-white transition hover:bg-[#a7773f] focus:outline-none focus:ring-2 focus:ring-[#b8894b]/30 focus:ring-offset-2"
            >
              <Save size={16} />
              {editingItem ? "Save Changes" : "Add Food Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  Clapperboard,
  Lightbulb,
  Mic2,
  Plus,
  Trash2,
  Utensils,
  Users,
  Volume2,
  Warehouse,
  Wrench,
} from "lucide-react";

import type {
  BookingFormData,
  ServiceItem,
} from "../types";

type ServicesItemsStepProps = {
  formData: BookingFormData;
  updateServices: (
    services: BookingFormData["services"],
  ) => void;
};

type Category = {
  id: string;
  name: string;
  icon: React.ElementType;
};

const categories: Category[] = [
  {
    id: "venue",
    name: "Venue",
    icon: Warehouse,
  },
  {
    id: "catering",
    name: "Catering",
    icon: Utensils,
  },
  {
    id: "decoration",
    name: "Decoration",
    icon: Clapperboard,
  },
  {
    id: "lighting",
    name: "Lighting",
    icon: Lightbulb,
  },
  {
    id: "sound",
    name: "Sound",
    icon: Volume2,
  },
  {
    id: "photography",
    name: "Photography",
    icon: Camera,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: Mic2,
  },
  {
    id: "staff",
    name: "Staff",
    icon: Users,
  },
  {
    id: "custom",
    name: "Custom",
    icon: Wrench,
  },
];

const defaultItems: Record<
  string,
  Omit<ServiceItem, "id">[]
> = {
  venue: [
    {
      category: "Venue",
      name: "Event Venue",
      description: "Event venue rental",
      quantity: 1,
      unitPrice: 0,
    },
  ],

  catering: [
    {
      category: "Catering",
      name: "Premium Catering",
      description: "Multi-cuisine buffet",
      quantity: 1,
      unitPrice: 0,
    },
  ],

  decoration: [
    {
      category: "Decoration",
      name: "Stage Decoration",
      description: "Elegant stage setup",
      quantity: 1,
      unitPrice: 0,
    },
  ],

  lighting: [
    {
      category: "Lighting",
      name: "Event Lighting",
      description: "Professional lighting setup",
      quantity: 1,
      unitPrice: 0,
    },
  ],

  sound: [
    {
      category: "Sound",
      name: "Sound & Audio",
      description: "Professional sound system",
      quantity: 1,
      unitPrice: 0,
    },
  ],

  photography: [
    {
      category: "Photography",
      name: "Event Photography",
      description: "Professional event photography",
      quantity: 1,
      unitPrice: 0,
    },
  ],

  entertainment: [
    {
      category: "Entertainment",
      name: "Live Entertainment",
      description: "Entertainment package",
      quantity: 1,
      unitPrice: 0,
    },
  ],

  staff: [
    {
      category: "Staff",
      name: "Event Staff",
      description: "Event support staff",
      quantity: 1,
      unitPrice: 0,
    },
  ],
};

export default function ServicesItemsStep({
  formData,
  updateServices,
}: ServicesItemsStepProps) {
  const [selectedCategory, setSelectedCategory] =
    useState("catering");

  const [showCustomForm, setShowCustomForm] =
    useState(false);

  const [customName, setCustomName] =
    useState("");

  const [customDescription, setCustomDescription] =
    useState("");

  const [customQuantity, setCustomQuantity] =
    useState("1");

  const [customPrice, setCustomPrice] =
    useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const addItem = (categoryId: string) => {
    if (categoryId === "custom") {
      setShowCustomForm(true);
      return;
    }

    const availableItems =
      defaultItems[categoryId];

    if (!availableItems?.length) {
      return;
    }

    const item = availableItems[0];

    const newItem: ServiceItem = {
      ...item,
      id: crypto.randomUUID(),
    };

    updateServices([
      ...formData.services,
      newItem,
    ]);
  };

  const addCustomItem = () => {
    if (!customName.trim()) {
      return;
    }

    const newItem: ServiceItem = {
      id: crypto.randomUUID(),
      category: "Custom",
      name: customName.trim(),
      description:
        customDescription.trim(),
      quantity:
        Math.max(Number(customQuantity) || 1, 1),
      unitPrice:
        Math.max(Number(customPrice) || 0, 0),
    };

    updateServices([
      ...formData.services,
      newItem,
    ]);

    setCustomName("");
    setCustomDescription("");
    setCustomQuantity("1");
    setCustomPrice("");
    setShowCustomForm(false);
  };

  const removeItem = (id: string) => {
    updateServices(
      formData.services.filter(
        (item) => item.id !== id,
      ),
    );
  };

  const updateItem = (
    id: string,
    field: "quantity" | "unitPrice",
    value: number,
  ) => {
    updateServices(
      formData.services.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: Math.max(value, 0),
            }
          : item,
      ),
    );
  };

  const totalItems = formData.services.length;

  const subtotal = formData.services.reduce(
    (total, item) =>
      total + item.quantity * item.unitPrice,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--sage)]">
          Step 2
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--sage-dark)] sm:text-3xl">
          Add Services & Items
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--taupe)] sm:text-base">
          Select the services your client needs and
          add the items, quantities and prices.
        </p>
      </div>

      {/* Categories */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--sage-dark)]">
              Service Categories
            </h3>

            <p className="mt-1 text-xs text-[var(--taupe)]">
              Select a category to add a service.
            </p>
          </div>

          <span className="rounded-full bg-[var(--ivory)] px-3 py-1.5 text-xs font-medium text-[var(--taupe)]">
            {totalItems}{" "}
            {totalItems === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {categories.map((category) => {
            const Icon = category.icon;

            const isSelected =
              selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setSelectedCategory(category.id)
                }
                className={[
                  "relative flex min-h-[82px] flex-col",
                  "items-center justify-center gap-2",
                  "rounded-xl border px-2 py-3",
                  "transition-all duration-200",
                  isSelected
                    ? "border-[var(--sage)] bg-[#b49a6a] text-white shadow-sm"
                    : "border-transparent bg-[var(--ivory)] text-[var(--sage-dark)] hover:border-[var(--border)] hover:bg-[#f5f1e8]",
                ].join(" ")}
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                />

                <span className="text-[10px] font-medium leading-tight sm:text-xs">
                  {category.name}
                </span>

                {isSelected && (
                  <span className="absolute right-1.5 top-1.5">
                    <Check size={11} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Add button */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() =>
              addItem(selectedCategory)
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--sage-dark)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--sage)]"
          >
            <Plus size={17} />

            {selectedCategory === "custom"
              ? "Add Custom Item"
              : `Add ${categories.find(
                  (category) =>
                    category.id ===
                    selectedCategory,
                )?.name}`}
          </button>
        </div>
      </div>

      {/* Custom Item Form */}
      {showCustomForm && (
        <div className="rounded-2xl border border-[var(--sage)]/20 bg-[#faf8f2] p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-[var(--sage-dark)]">
                Add Custom Item
              </h3>

              <p className="mt-1 text-xs text-[var(--taupe)]">
                Add any service or item that is not
                listed above.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCustomForm(false)
              }
              className="text-xs font-medium text-[var(--taupe)] hover:text-gray-900"
            >
              Cancel
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--taupe)]">
                Item Name *
              </label>

              <input
                type="text"
                value={customName}
                onChange={(event) =>
                  setCustomName(event.target.value)
                }
                placeholder="e.g. Fireworks"
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none focus:border-[var(--sage)]"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--taupe)]">
                Description
              </label>

              <input
                type="text"
                value={customDescription}
                onChange={(event) =>
                  setCustomDescription(
                    event.target.value,
                  )
                }
                placeholder="Short description"
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none focus:border-[var(--sage)]"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--taupe)]">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={customQuantity}
                onChange={(event) =>
                  setCustomQuantity(
                    event.target.value,
                  )
                }
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none focus:border-[var(--sage)]"
              />
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--taupe)]">
                Unit Price
              </label>

              <input
                type="number"
                min="0"
                value={customPrice}
                onChange={(event) =>
                  setCustomPrice(
                    event.target.value,
                  )
                }
                placeholder="₹ 0"
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none focus:border-[var(--sage)]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addCustomItem}
            disabled={!customName.trim()}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--sage-dark)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--sage)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={17} />
            Add Item
          </button>
        </div>
      )}

      {/* Selected Items */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h3 className="font-semibold text-[var(--sage-dark)]">
              Selected Services
            </h3>

            <p className="mt-1 text-xs text-[var(--taupe)]">
              Adjust quantity and price for each item.
            </p>
          </div>

          <span className="text-sm font-semibold text-[var(--sage-dark)]">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {formData.services.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ivory)]">
              <Plus
                size={22}
                className="text-[var(--sage)]"
              />
            </div>

            <h4 className="mt-4 text-sm font-semibold text-gray-900">
              No services added
            </h4>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--taupe)]">
              Select a service category above and
              click Add to include it in the estimate.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {formData.services.map((item) => {
              const itemTotal =
                item.quantity * item.unitPrice;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5"
                >
                  <div className="flex gap-3">
                    {/* Item icon */}
                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ivory)] sm:flex">
                      <Warehouse
                        size={19}
                        className="text-[var(--sage)]"
                      />
                    </div>

                    {/* Item details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-[var(--taupe)]">
                            {item.description ||
                              item.category}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.id)
                          }
                          aria-label={`Remove ${item.name}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Controls */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {/* Quantity */}
                        <div>
                          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[var(--taupe)]">
                            Quantity
                          </label>

                          <div className="flex h-10 overflow-hidden rounded-lg border border-[var(--border)]">
                            <button
                              type="button"
                              onClick={() =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  item.quantity - 1,
                                )
                              }
                              disabled={
                                item.quantity <= 1
                              }
                              className="w-10 text-gray-500 transition hover:bg-[var(--ivory)] disabled:opacity-30"
                            >
                              −
                            </button>

                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(event) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  Number(
                                    event.target.value,
                                  ) || 1,
                                )
                              }
                              className="min-w-0 flex-1 border-x border-[var(--border)] text-center text-sm font-semibold outline-none"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  item.quantity + 1,
                                )
                              }
                              className="w-10 text-gray-500 transition hover:bg-[var(--ivory)]"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div>
                          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[var(--taupe)]">
                            Unit Price
                          </label>

                          <div className="flex h-10 items-center overflow-hidden rounded-lg border border-[var(--border)]">
                            <span className="pl-3 text-xs text-[var(--taupe)]">
                              ₹
                            </span>

                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(event) =>
                                updateItem(
                                  item.id,
                                  "unitPrice",
                                  Number(
                                    event.target.value,
                                  ) || 0,
                                )
                              }
                              className="min-w-0 flex-1 px-2 text-sm outline-none"
                            />
                          </div>
                        </div>

                        {/* Total */}
                        <div>
                          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[var(--taupe)]">
                            Total
                          </label>

                          <div className="flex h-10 items-center rounded-lg bg-[var(--ivory)] px-3">
                            <span className="text-sm font-semibold text-[var(--sage-dark)]">
                              {formatCurrency(
                                itemTotal,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom subtotal */}
        {formData.services.length > 0 && (
          <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--ivory)] px-5 py-4">
            <span className="text-sm font-medium text-gray-700">
              Current Subtotal
            </span>

            <span className="text-lg font-bold text-[var(--sage-dark)]">
              {formatCurrency(subtotal)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import {
  IndianRupee,
  Percent,
  ReceiptText,
  Tag,
} from "lucide-react";

import type { BookingFormData } from "../types";

type PricingStepProps = {
  formData: BookingFormData;
  updateField: (
    field: keyof BookingFormData,
    value: string,
  ) => void;
};

const GST_RATE = 18;

export default function PricingStep({
  formData,
  updateField,
}: PricingStepProps) {
  /**
   * Calculate subtotal from selected services/items.
   */
  const subtotal = formData.services.reduce(
    (total, item) =>
      total + item.quantity * item.unitPrice,
    0,
  );

  /**
   * Calculate discount.
   */
  const discountValue = Number(
    formData.discountValue || 0,
  );

  const discountAmount =
    formData.discountType === "percentage"
      ? subtotal * (discountValue / 100)
      : discountValue;

  /**
   * Prevent discount from exceeding subtotal.
   */
  const safeDiscount = Math.min(
    Math.max(discountAmount, 0),
    subtotal,
  );

  /**
   * Amount after discount.
   */
  const taxableAmount = Math.max(
    subtotal - safeDiscount,
    0,
  );

  /**
   * Additional charges.
   */
  const additionalCharges = Math.max(
    Number(formData.additionalCharges || 0),
    0,
  );

  /**
   * GST.
   *
   * GST is calculated on the discounted
   * service amount.
   */
  const gst = taxableAmount * (GST_RATE / 100);

  /**
   * Final total.
   */
  const grandTotal =
    taxableAmount +
    gst +
    additionalCharges;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sage-light)]">
            <ReceiptText
              size={21}
              className="text-[var(--sage-dark)]"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--sage-dark)]">
              Pricing
            </h2>

            <p className="mt-1 text-sm text-[var(--taupe)]">
              Review services, discounts and charges.
            </p>
          </div>
        </div>
      </div>

      {/* Selected Services */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h3 className="font-semibold text-[var(--sage-dark)]">
            Services & Items
          </h3>

          <p className="mt-1 text-xs text-[var(--taupe)]">
            Prices are calculated from the items added
            in the previous step.
          </p>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {formData.services.map((item) => {
            const itemTotal =
              item.quantity * item.unitPrice;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-[var(--taupe)]">
                    {item.quantity} ×{" "}
                    {formatCurrency(item.unitPrice)}
                  </p>

                  {item.category && (
                    <span className="mt-2 inline-flex rounded-full bg-[var(--ivory)] px-2.5 py-1 text-[10px] font-medium text-[var(--taupe)]">
                      {item.category}
                    </span>
                  )}
                </div>

                <p className="shrink-0 text-sm font-semibold text-[var(--sage-dark)]">
                  {formatCurrency(itemTotal)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--ivory)] px-5 py-4">
          <span className="text-sm font-medium text-gray-700">
            Subtotal
          </span>

          <span className="text-base font-semibold text-[var(--sage-dark)]">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>

      {/* Discount */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5ead8]">
            <Tag
              size={18}
              className="text-[var(--sage-dark)]"
            />
          </div>

          <div>
            <h3 className="font-semibold text-[var(--sage-dark)]">
              Discount
            </h3>

            <p className="mt-1 text-xs text-[var(--taupe)]">
              Apply a percentage or fixed discount.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_140px]">
          {/* Discount Type */}
          <select
            value={formData.discountType}
            onChange={(event) =>
              updateField(
                "discountType",
                event.target.value,
              )
            }
            className="h-12 rounded-xl border border-[var(--border)] bg-[var(--ivory)] px-4 text-sm text-gray-900 outline-none transition focus:border-[var(--sage)]"
          >
            <option value="percentage">
              Percentage
            </option>

            <option value="fixed">
              Fixed Amount
            </option>
          </select>

          {/* Discount Value */}
          <div className="relative">
            {formData.discountType ===
              "percentage" && (
              <Percent
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--taupe)]"
              />
            )}

            {formData.discountType === "fixed" && (
              <IndianRupee
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--taupe)]"
              />
            )}

            <input
              type="number"
              min="0"
              value={formData.discountValue}
              onChange={(event) =>
                updateField(
                  "discountValue",
                  event.target.value,
                )
              }
              placeholder="0"
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--ivory)] pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[var(--sage)]"
            />
          </div>
        </div>

        {safeDiscount > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--sage-light)]/50 px-4 py-3">
            <span className="text-sm text-[var(--taupe)]">
              Discount Applied
            </span>

            <span className="text-sm font-semibold text-[var(--sage-dark)]">
              - {formatCurrency(safeDiscount)}
            </span>
          </div>
        )}
      </div>

      {/* Additional Charges */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-[var(--sage-dark)]">
          Additional Charges
        </h3>

        <p className="mt-1 text-xs text-[var(--taupe)]">
          Add service fees, transportation or any
          other additional charges.
        </p>

        <div className="relative mt-4">
          <IndianRupee
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--taupe)]"
          />

          <input
            type="number"
            min="0"
            value={formData.additionalCharges}
            onChange={(event) =>
              updateField(
                "additionalCharges",
                event.target.value,
              )
            }
            placeholder="0"
            className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--ivory)] pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[var(--sage)]"
          />
        </div>
      </div>

      {/* Price Summary */}
      <div className="rounded-2xl bg-[var(--sage-dark)] p-5 text-white shadow-lg sm:p-6">
        <h3 className="text-lg font-semibold">
          Price Summary
        </h3>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Subtotal</span>

            <span>
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Discount</span>

            <span>
              - {formatCurrency(safeDiscount)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-white/70">
            <span>GST ({GST_RATE}%)</span>

            <span>
              {formatCurrency(gst)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Additional Charges</span>

            <span>
              {formatCurrency(additionalCharges)}
            </span>
          </div>

          <div className="my-4 h-px bg-white/15" />

          <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-4">
            <span className="font-semibold">
              Grand Total
            </span>

            <span className="text-xl font-bold sm:text-2xl">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
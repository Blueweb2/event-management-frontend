"use client";

import {
  CalendarDays,
  Clock3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";

import type { BookingFormData } from "../types";

type EstimatePreviewStepProps = {
  formData: BookingFormData;
  updateField: (
    field: keyof BookingFormData,
    value: string,
  ) => void;
};

const GST_RATE = 18;

export default function EstimatePreviewStep({
  formData,
  updateField,
}: EstimatePreviewStepProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const subtotal = formData.services.reduce(
    (total, item) =>
      total + item.quantity * item.unitPrice,
    0,
  );

  const discountValue = Number(
    formData.discountValue || 0,
  );

  const discountAmount =
    formData.discountType === "percentage"
      ? subtotal * (discountValue / 100)
      : discountValue;

  const safeDiscount = Math.min(
    Math.max(discountAmount, 0),
    subtotal,
  );

  const taxableAmount = Math.max(
    subtotal - safeDiscount,
    0,
  );

  const additionalCharges = Math.max(
    Number(formData.additionalCharges || 0),
    0,
  );

  const gst =
    taxableAmount * (GST_RATE / 100);

  const grandTotal =
    taxableAmount +
    gst +
    additionalCharges;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--sage)]">
          Step 4
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--sage-dark)] sm:text-3xl">
          Estimate Preview
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--taupe)] sm:text-base">
          Review the estimate details before sending it
          to the client.
        </p>
      </div>

      {/* Estimate Document */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-[var(--border)] px-5 py-6 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-xl font-light tracking-[0.25em] text-[var(--sage-dark)]">
                PIRCELLO
              </p>

              <p className="mt-1 text-[9px] tracking-[0.45em] text-[var(--taupe)]">
                EVENTS
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--taupe)]">
                Estimate
              </p>

              <p className="mt-1 text-lg font-semibold text-[var(--sage-dark)]">
                #EST-1048
              </p>

              <p className="mt-1 text-xs text-[var(--taupe)]">
                Prepared for client
              </p>
            </div>
          </div>
        </div>

        {/* Event Information */}
        <div className="border-b border-[var(--border)] px-5 py-6 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--taupe)]">
                Event
              </p>

              <h3 className="mt-1 text-xl font-semibold text-[var(--sage-dark)]">
                {formData.eventName ||
                  "Untitled Event"}
              </h3>

              <p className="mt-1 text-sm text-[var(--taupe)]">
                {formData.eventType ||
                  "Event Type"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:text-right">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--taupe)]">
                  Date
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {formData.eventDate ||
                    "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--taupe)]">
                  Guests
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {formData.guests || "0"}
                </p>
              </div>
            </div>
          </div>

          {/* Event details */}
          <div className="mt-5 grid gap-3 rounded-xl bg-[var(--ivory)] p-4 sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <CalendarDays
                size={16}
                className="mt-0.5 shrink-0 text-[var(--sage)]"
              />

              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--taupe)]">
                  Date
                </p>

                <p className="mt-0.5 text-xs font-medium text-gray-900">
                  {formData.eventDate ||
                    "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock3
                size={16}
                className="mt-0.5 shrink-0 text-[var(--sage)]"
              />

              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--taupe)]">
                  Time
                </p>

                <p className="mt-0.5 text-xs font-medium text-gray-900">
                  {formData.eventTime ||
                    "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin
                size={16}
                className="mt-0.5 shrink-0 text-[var(--sage)]"
              />

              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--taupe)]">
                  Venue
                </p>

                <p className="mt-0.5 text-xs font-medium text-gray-900">
                  {formData.location ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {formData.description && (
            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--taupe)]">
                Event Description
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {formData.description}
              </p>
            </div>
          )}
        </div>

        {/* Client Information */}
        <div className="border-b border-[var(--border)] px-5 py-6 sm:px-8">
          <div className="flex items-center gap-2">
            <Users
              size={17}
              className="text-[var(--sage)]"
            />

            <h3 className="font-semibold text-[var(--sage-dark)]">
              Client Details
            </h3>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[var(--taupe)]">
                Client Name
              </label>

              <input
                type="text"
                value={formData.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
                placeholder="Client name"
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--ivory)] px-3 text-sm outline-none transition focus:border-[var(--sage)]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[var(--taupe)]">
                Phone
              </label>

              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--taupe)]"
                />

                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value,
                    )
                  }
                  placeholder="+91..."
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--ivory)] pl-9 pr-3 text-sm outline-none transition focus:border-[var(--sage)]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[var(--taupe)]">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--taupe)]"
                />

                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value,
                    )
                  }
                  placeholder="client@email.com"
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--ivory)] pl-9 pr-3 text-sm outline-none transition focus:border-[var(--sage)]"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mt-4">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[var(--taupe)]">
              Notes
            </label>

            <textarea
              value={formData.message}
              onChange={(event) =>
                updateField(
                  "message",
                  event.target.value,
                )
              }
              placeholder="Additional notes for the client..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--ivory)] px-3 py-3 text-sm outline-none transition focus:border-[var(--sage)]"
            />
          </div>
        </div>

        {/* Services */}
        <div className="px-5 py-6 sm:px-8">
          <div className="flex items-center gap-2">
            <FileText
              size={17}
              className="text-[var(--sage)]"
            />

            <h3 className="font-semibold text-[var(--sage-dark)]">
              Services & Items
            </h3>
          </div>

          {/* Desktop table */}
          <div className="mt-4 hidden overflow-hidden rounded-xl border border-[var(--border)] sm:block">
            <div className="grid grid-cols-[1fr_80px_130px_130px] bg-[var(--ivory)] px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--taupe)]">
              <span>Service / Item</span>
              <span className="text-center">
                Qty
              </span>
              <span className="text-right">
                Unit Price
              </span>
              <span className="text-right">
                Total
              </span>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {formData.services.map((item) => {
                const itemTotal =
                  item.quantity *
                  item.unitPrice;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_80px_130px_130px] items-center px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>

                      <p className="mt-0.5 text-xs text-[var(--taupe)]">
                        {item.category}
                      </p>
                    </div>

                    <span className="text-center text-sm text-gray-700">
                      {item.quantity}
                    </span>

                    <span className="text-right text-sm text-gray-700">
                      {formatCurrency(
                        item.unitPrice,
                      )}
                    </span>

                    <span className="text-right text-sm font-semibold text-[var(--sage-dark)]">
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="mt-4 space-y-3 sm:hidden">
            {formData.services.map((item) => {
              const itemTotal =
                item.quantity *
                item.unitPrice;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-[var(--taupe)]">
                        {item.category}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-[var(--sage-dark)]">
                      {formatCurrency(itemTotal)}
                    </p>
                  </div>

                  <div className="mt-3 flex justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--taupe)]">
                    <span>
                      Qty:{" "}
                      <strong className="text-gray-900">
                        {item.quantity}
                      </strong>
                    </span>

                    <span>
                      Unit:{" "}
                      <strong className="text-gray-900">
                        {formatCurrency(
                          item.unitPrice,
                        )}
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price breakdown */}
          <div className="mt-6 ml-auto max-w-sm">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>

                <span className="font-medium text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  Discount
                  {formData.discountType ===
                    "percentage" &&
                    discountValue > 0 && (
                      <span className="ml-1 text-xs">
                        ({discountValue}%)
                      </span>
                    )}
                </span>

                <span className="font-medium text-green-600">
                  - {formatCurrency(safeDiscount)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  GST ({GST_RATE}%)
                </span>

                <span className="font-medium text-gray-900">
                  {formatCurrency(gst)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  Additional Charges
                </span>

                <span className="font-medium text-gray-900">
                  {formatCurrency(
                    additionalCharges,
                  )}
                </span>
              </div>

              <div className="my-3 h-px bg-[var(--border)]" />

              <div className="flex items-center justify-between rounded-xl bg-[#f4ecdc] px-4 py-4">
                <span className="font-semibold text-[var(--sage-dark)]">
                  Grand Total
                </span>

                <span className="text-xl font-bold text-[var(--sage-dark)]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] bg-[var(--ivory)] px-5 py-5 text-center sm:px-8">
          <p className="text-xs italic text-[var(--taupe)]">
            Events Beyond Expectations
          </p>
        </div>
      </div>

      {/* Final note */}
      <div className="rounded-xl border border-[var(--sage)]/20 bg-[var(--sage-light)]/30 px-4 py-3">
        <p className="text-xs leading-5 text-[var(--sage-dark)]">
          Review all event, client, service and pricing
          details before creating the estimate.
        </p>
      </div>
    </div>
  );
}
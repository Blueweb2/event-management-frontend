"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Share2,
  Users,
} from "lucide-react";
import { useState } from "react";

import type { BookingFormData } from "../types";
import {
  createEstimate,
  type Estimate,
} from "@/lib/estimates.api";

type EstimatePreviewStepProps = {
  formData: BookingFormData;
  updateField: (
    field: keyof BookingFormData,
    value: string,
  ) => void;
  estimate?: Estimate | null;
  onEstimateCreated?: (estimate: Estimate) => void;
  isCreating?: boolean;
  onCreateEstimate?: () => Promise<void>;
};

export default function EstimatePreviewStep({
  formData,
  updateField,
  estimate: propEstimate,
  onEstimateCreated,
  isCreating: propIsCreating,
  onCreateEstimate,
}: EstimatePreviewStepProps) {
  // ==========================================
  // State
  // ==========================================

  const [internalEstimate, setInternalEstimate] =
    useState<Estimate | null>(null);

  const [internalIsCreating, setInternalIsCreating] =
    useState(false);

  const estimate =
    propEstimate !== undefined ? propEstimate : internalEstimate;
  const setEstimate = setInternalEstimate;

  const isCreating =
    propIsCreating !== undefined ? propIsCreating : internalIsCreating;
  const setIsCreating = setInternalIsCreating;

  const [error, setError] =
    useState("");

  const [shareMessage, setShareMessage] =
    useState("");

  // ==========================================
  // Currency
  // ==========================================

  const formatCurrency = (
    amount: number,
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      },
    ).format(Number(amount) || 0);
  };

  // ==========================================
  // Temporary Preview Calculation
  //
  // IMPORTANT:
  // These values are ONLY for preview.
  //
  // Backend recalculates everything when
  // Create Estimate is clicked.
  // ==========================================

  const previewSubtotal =
    formData.services.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0) *
          Number(item.unitPrice || 0),
      0,
    );

  const previewDiscountValue = Number(
    formData.discountValue || 0,
  );

  const previewDiscount =
    formData.discountType ===
    "percentage"
      ? previewSubtotal *
        (previewDiscountValue / 100)
      : previewDiscountValue;

  const previewSafeDiscount =
    Math.min(
      Math.max(
        previewDiscount,
        0,
      ),
      previewSubtotal,
    );

  const previewTaxableAmount =
    Math.max(
      previewSubtotal -
        previewSafeDiscount,
      0,
    );

  const previewAdditionalCharges =
    Math.max(
      Number(
        formData.additionalCharges || 0,
      ),
      0,
    );

  const previewGst =
    previewTaxableAmount * 0.18;

  const previewGrandTotal =
    previewTaxableAmount +
    previewGst +
    previewAdditionalCharges;

  // ==========================================
  // Values displayed on screen
  //
  // Before creation → preview values
  // After creation  → backend values
  // ==========================================

  const subtotal =
    estimate?.subtotal ??
    previewSubtotal;

  const discount =
    estimate?.discount ??
    previewSafeDiscount;

  const gstRate =
    estimate?.gstRate ?? 18;

  const gstAmount =
    estimate?.gstAmount ??
    previewGst;

  const additionalCharges =
    estimate?.additionalCharges ??
    previewAdditionalCharges;

  const grandTotal =
    estimate?.total ??
    previewGrandTotal;

  // ==========================================
  // Create Estimate
  // ==========================================

  const handleCreateEstimate =
    async () => {
      if (isCreating) {
        return;
      }

      if (onCreateEstimate) {
        return onCreateEstimate();
      }

      setError("");
      setShareMessage("");
      setIsCreating(true);

      try {
        // --------------------------------------
        // Send ONLY identifiers + quantity.
        //
        // Never send unitPrice/pricingType/total.
        // Backend gets prices from MongoDB.
        // --------------------------------------

        const createdEstimate =
          await createEstimate({
            eventName:
              formData.eventName.trim(),

            eventType:
              formData.eventType.trim(),

            eventDate:
              formData.eventDate,

            eventTime:
              formData.eventTime.trim(),

            guests:
              Number(formData.guests),

            location:
              formData.location.trim(),

            description:
              formData.description.trim(),

            client: {
              name:
                formData.name.trim(),

              phone:
                formData.phone.trim(),

              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              message:
                formData.message?.trim() ||
                "",
            },

            services:
              formData.services.map(
                (item) => ({
                  serviceId:
                    item.serviceId,

                  optionId:
                    item.optionId ??
                    null,

                  quantity:
                    Number(
                      item.quantity || 1,
                    ),
                }),
              ),

            discountType:
              formData.discountType ||
              "percentage",

            discountValue:
              Number(
                formData.discountValue ||
                  0,
              ),

            additionalCharges:
              Number(
                formData.additionalCharges ||
                  0,
              ),
          });

        // --------------------------------------
        // Save backend response
        // --------------------------------------

        setEstimate(
          createdEstimate,
        );

        onEstimateCreated?.(
          createdEstimate,
        );
      } catch (err) {
        console.error(
          "Create estimate failed:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to create estimate. Please try again.",
        );
      } finally {
        setIsCreating(false);
      }
    };

  // ==========================================
  // Download / Print
  // ==========================================

  const handleDownload = () => {
    window.print();
  };

  // ==========================================
  // Share Estimate
  // ==========================================

  const handleShare = async () => {
    setShareMessage("");

    const estimateNumber =
      estimate?.estimateNumber ||
      "Estimate";

    const shareText = [
      "Pircello Events",
      "",
      `Estimate: #${estimateNumber}`,
      `Event: ${formData.eventName}`,
      `Event Type: ${formData.eventType}`,
      `Date: ${formData.eventDate}`,
      `Guests: ${formData.guests}`,
      "",
      `Grand Total: ${formatCurrency(
        grandTotal,
      )}`,
    ].join("\n");

    try {
      if (
        typeof navigator !==
          "undefined" &&
        navigator.share
      ) {
        await navigator.share({
          title:
            `Pircello Events - ${estimateNumber}`,

          text: shareText,
        });

        setShareMessage(
          "Estimate shared successfully.",
        );

        return;
      }

      if (
        typeof navigator !==
          "undefined" &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          shareText,
        );

        setShareMessage(
          "Estimate details copied to clipboard.",
        );

        return;
      }

      setShareMessage(
        "Sharing is not supported on this device.",
      );
    } catch (err) {
      // User cancelled native share.
      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "Share failed:",
        err,
      );

      setShareMessage(
        "Unable to share the estimate.",
      );
    }
  };

  // ==========================================
  // Email Estimate
  // ==========================================

  const handleEmail = () => {
    const estimateNumber =
      estimate?.estimateNumber ||
      "Estimate";

    const subject =
      encodeURIComponent(
        `Estimate #${estimateNumber} - ${formData.eventName}`,
      );

    const body =
      encodeURIComponent(
        [
          `Hello ${formData.name},`,
          "",
          "Please find the estimate details for your event:",
          "",
          `Estimate: #${estimateNumber}`,
          `Event: ${formData.eventName}`,
          `Event Type: ${formData.eventType}`,
          `Date: ${formData.eventDate}`,
          `Time: ${formData.eventTime}`,
          `Guests: ${formData.guests}`,
          `Venue: ${formData.location}`,
          "",
          `Subtotal: ${formatCurrency(
            subtotal,
          )}`,

          `Discount: - ${formatCurrency(
            discount,
          )}`,

          `GST (${gstRate}%): ${formatCurrency(
            gstAmount,
          )}`,

          `Additional Charges: ${formatCurrency(
            additionalCharges,
          )}`,

          "",
          `Grand Total: ${formatCurrency(
            grandTotal,
          )}`,

          "",
          "Regards,",
          "Pircello Events",
        ].join("\n"),
      );

    window.location.href =
      `mailto:${formData.email}?subject=${subject}&body=${body}`;
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="space-y-6">
      {/* ====================================== */}
      {/* Page Heading */}
      {/* ====================================== */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--sage)]">
          Step 4
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--sage-dark)] sm:text-3xl">
          Estimate Preview
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--taupe)] sm:text-base">
          Review the estimate details before
          sending it to the client.
        </p>
      </div>

      {/* ====================================== */}
      {/* Error */}
      {/* ====================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ====================================== */}
      {/* Success */}
      {/* ====================================== */}

      {estimate && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-green-600"
          />

          <div>
            <p className="text-sm font-semibold text-green-800">
              Estimate created successfully
            </p>

            <p className="mt-0.5 text-xs text-green-700">
              Estimate #
              {estimate.estimateNumber}
            </p>
          </div>
        </div>
      )}

      {/* ====================================== */}
      {/* Estimate Document */}
      {/* ====================================== */}

      <div
        id="estimate-document"
        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm"
      >
        {/* ==================================== */}
        {/* Header */}
        {/* ==================================== */}

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
                #
                {estimate?.estimateNumber ||
                  "DRAFT"}
              </p>

              <p className="mt-1 text-xs text-[var(--taupe)]">
                {estimate
                  ? "Saved estimate"
                  : "Preview"}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================== */}
        {/* Event Information */}
        {/* ==================================== */}

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

        {/* ==================================== */}
        {/* Client Information */}
        {/* ==================================== */}

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

        {/* ==================================== */}
        {/* Services */}
        {/* ==================================== */}

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
              <span>
                Service / Item
              </span>

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
              {formData.services.map(
                (item) => {
                  const itemTotal =
                    Number(
                      item.quantity || 0,
                    ) *
                    Number(
                      item.unitPrice || 0,
                    );

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

                          {item.unitLabel
                            ? ` • ${item.unitLabel}`
                            : ""}
                        </p>
                      </div>

                      <span className="text-center text-sm text-gray-700">
                        {item.quantity}
                      </span>

                      <span className="text-right text-sm text-gray-700">
                        {formatCurrency(
                          Number(
                            item.unitPrice ||
                              0,
                          ),
                        )}
                      </span>

                      <span className="text-right text-sm font-semibold text-[var(--sage-dark)]">
                        {formatCurrency(
                          itemTotal,
                        )}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Mobile cards */}

          <div className="mt-4 space-y-3 sm:hidden">
            {formData.services.map(
              (item) => {
                const itemTotal =
                  Number(
                    item.quantity || 0,
                  ) *
                  Number(
                    item.unitPrice || 0,
                  );

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
                        {formatCurrency(
                          itemTotal,
                        )}
                      </p>
                    </div>

                    <div className="mt-3 flex justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--taupe)]">
                      <span>
                        Qty:{" "}
                        <strong className="text-gray-900">
                          {
                            item.quantity
                          }
                        </strong>
                      </span>

                      <span>
                        Unit:{" "}
                        <strong className="text-gray-900">
                          {formatCurrency(
                            Number(
                              item.unitPrice ||
                                0,
                            ),
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          {/* ================================= */}
          {/* Price Breakdown */}
          {/* ================================= */}

          <div className="mt-6 ml-auto max-w-sm">
            <div className="space-y-3 text-sm">
              {/* Subtotal */}

              <div className="flex justify-between text-gray-600">
                <span>
                  Subtotal
                </span>

                <span className="font-medium text-gray-900">
                  {formatCurrency(
                    subtotal,
                  )}
                </span>
              </div>

              {/* Discount */}

              <div className="flex justify-between text-gray-600">
                <span>
                  Discount

                  {formData.discountType ===
                    "percentage" &&
                    previewDiscountValue >
                      0 && (
                      <span className="ml-1 text-xs">
                        (
                        {
                          previewDiscountValue
                        }
                        %)
                      </span>
                    )}
                </span>

                <span className="font-medium text-green-600">
                  -{" "}
                  {formatCurrency(
                    discount,
                  )}
                </span>
              </div>

              {/* GST */}

              <div className="flex justify-between text-gray-600">
                <span>
                  GST ({gstRate}%)
                </span>

                <span className="font-medium text-gray-900">
                  {formatCurrency(
                    gstAmount,
                  )}
                </span>
              </div>

              {/* Additional Charges */}

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

              {/* Grand Total */}

              <div className="flex items-center justify-between rounded-xl bg-[#f4ecdc] px-4 py-4">
                <span className="font-semibold text-[var(--sage-dark)]">
                  Grand Total
                </span>

                <span className="text-xl font-bold text-[var(--sage-dark)]">
                  {formatCurrency(
                    grandTotal,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================== */}
        {/* Footer */}
        {/* ==================================== */}

        <div className="border-t border-[var(--border)] bg-[var(--ivory)] px-5 py-5 text-center sm:px-8">
          <p className="text-xs italic text-[var(--taupe)]">
            Events Beyond Expectations
          </p>
        </div>
      </div>

      {/* ====================================== */}
      {/* Estimate Actions */}
      {/* ====================================== */}

      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sage-light)]">
            {estimate ? (
              <CheckCircle2
                size={22}
                className="text-[var(--sage-dark)]"
              />
            ) : (
              <FileText
                size={22}
                className="text-[var(--sage-dark)]"
              />
            )}
          </div>

          <h3 className="mt-4 text-lg font-semibold text-[var(--sage-dark)]">
            {estimate
              ? "Estimate Created"
              : "Estimate Ready"}
          </h3>

          <p className="mt-1 text-sm text-[var(--taupe)]">
            {estimate
              ? `Estimate #${estimate.estimateNumber} has been saved successfully.`
              : "Review the details above, then create the estimate."}
          </p>
        </div>

        {/* Share message */}

        {shareMessage && (
          <div className="mt-4 rounded-xl bg-[var(--ivory)] px-4 py-3 text-center">
            <p className="text-xs font-medium text-[var(--sage-dark)]">
              {shareMessage}
            </p>
          </div>
        )}

        {/* Actions */}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {/* Download */}

          <button
            type="button"
            onClick={
              handleDownload
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--sage-dark)] transition hover:bg-[var(--ivory)]"
          >
            <Download size={17} />

            Download PDF
          </button>

          {/* Share */}

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--sage-dark)] transition hover:bg-[var(--ivory)]"
          >
            <Share2 size={17} />

            Share Estimate
          </button>

          {/* Email */}

          <button
            type="button"
            onClick={
              handleEmail
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--sage-dark)] transition hover:bg-[var(--ivory)]"
          >
            <Mail size={17} />

            Send by Email
          </button>
        </div>

        {/* ================================== */}
        {/* Create Estimate */}
        {/* ================================== */}

        {!estimate && (
          <button
            type="button"
            onClick={
              handleCreateEstimate
            }
            disabled={isCreating}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--sage-dark)] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                Creating Estimate...
              </>
            ) : (
              <>
                Create Estimate

                <ArrowRight
                  size={17}
                />
              </>
            )}
          </button>
        )}

        {/* Created status */}

        {estimate && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[var(--sage-light)] px-4 py-3">
            <CheckCircle2
              size={17}
              className="text-[var(--sage-dark)]"
            />

            <span className="text-sm font-semibold text-[var(--sage-dark)]">
              Estimate #
              {
                estimate.estimateNumber
              }{" "}
              saved
            </span>
          </div>
        )}
      </div>

      {/* ====================================== */}
      {/* Final Note */}
      {/* ====================================== */}

      <div className="rounded-xl border border-[var(--sage)]/20 bg-[var(--sage-light)]/30 px-4 py-3">
        <p className="text-xs leading-5 text-[var(--sage-dark)]">
          Review all event, client, service
          and pricing details before creating
          the estimate.
        </p>
      </div>
    </div>
  );
}
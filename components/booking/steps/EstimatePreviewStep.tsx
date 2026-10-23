"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileEdit,
  FileText,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  Share2,
  Users,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { BookingFormData } from "../types";
import {
  createEstimate,
  type Estimate,
} from "@/lib/estimates.api";
import { getServiceImageUrl } from "@/lib/services.api";
import EstimateExportActions from "@/components/estimates/EstimateExportActions";
import {
  type ClientDocumentData,
  defaultCompanyDetails,
  buildCateringData,
} from "@/lib/document-formatter";
import { formatTime24to12 } from "@/lib/time-utils";

type EstimatePreviewStepProps = {
  formData: BookingFormData;
  updateField: <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K],
  ) => void;
  estimate?: Estimate | null;
  onEstimateCreated?: (estimate: Estimate) => void;
  isCreating?: boolean;
  onCreateEstimate?: () => Promise<void>;
  isEditing?: boolean;
  onUpdateEstimate?: () => Promise<void>;
  onEditEstimate?: () => void;
  onStartFresh?: () => void;
};

export default function EstimatePreviewStep({
  formData,
  updateField,
  estimate: propEstimate,
  onEstimateCreated,
  isCreating: propIsCreating,
  onCreateEstimate,
  isEditing = false,
  onUpdateEstimate,
  onEditEstimate,
  onStartFresh,
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

  const previewFoodAmount = formData.foodMenu?.included
    ? formData.foodMenu.items.reduce(
        (total, item) =>
          total + Number(item.rate || 0) * Number(item.quantity || 0),
        0,
      )
    : 0;

  const previewServicesTotal =
    formData.services.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0) *
          Number(item.unitPrice || 0),
      0,
    );

  const previewSubtotal = previewServicesTotal + previewFoodAmount;

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

  const isGstEnabled =
    estimate?.gstEnabled !== undefined
      ? estimate.gstEnabled
      : formData.gstEnabled !== false;

  const previewGst = isGstEnabled
    ? previewTaxableAmount * 0.18
    : 0;

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
    estimate !== null && estimate !== undefined
      ? (estimate.gstEnabled === false ? 0 : (estimate.gstAmount ?? previewGst))
      : previewGst;

  const additionalCharges =
    estimate?.additionalCharges ??
    previewAdditionalCharges;

  const grandTotal =
    estimate?.total ??
    previewGrandTotal;

  // ==========================================
  // Client Document Payload for Export Studio / PDF / WhatsApp
  // ==========================================

  const constructedDocumentData: ClientDocumentData = {
    documentType: "ESTIMATE",
    documentNumber: estimate?.estimateNumber || "DRAFT",
    date: estimate?.createdAt
      ? new Date(estimate.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    status: estimate ? "PROPOSED" : "DRAFT",
    company: defaultCompanyDetails,
    client: {
      name: formData.name.trim() || "Valued Client",
      phone: formData.phone.trim() || "",
      email: formData.email.trim() || "",
      address: "",
    },
    event: {
      name: formData.eventName.trim() || "Untitled Event",
      type: formData.eventType.trim() || "Celebration",
      date: formData.eventDate || new Date().toISOString().slice(0, 10),
      time: formatTime24to12(formData.eventTime) || formData.eventTime || "",
      guests: Number(formData.guests || 100),
      location: formData.location.trim() || "Client Designated Venue",
      description: formData.description?.trim() || "",
    },
    services: formData.services.map((item, idx) => ({
      id: item.serviceId || String(idx + 1),
      name: item.name || "Event Service",
      category: item.category || "Service",
      quantity: Number(item.quantity || 1),
      unitLabel: item.unitLabel || "unit",
      unitPrice: Number(item.unitPrice || 0),
      total: Number(item.quantity || 1) * Number(item.unitPrice || 0),
    })),
    catering: buildCateringData(
      formData.foodMenu,
      Number(formData.guests || 100),
      subtotal,
      discount,
      isGstEnabled,
      gstRate
    ),
    subtotal: subtotal,
    discount: discount,
    discountType: formData.discountType || "percentage",
    discountValue: Number(formData.discountValue || 0),
    additionalCharges: additionalCharges,
    gstEnabled: isGstEnabled,
    gstRate: gstRate,
    gstAmount: gstAmount,
    total: grandTotal,
    currency: "INR",
    notes: formData.message?.trim() || "",
  };

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
              formData.description?.trim() || "",

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
              referralSource:
                formData.customReferral && formData.customReferral.trim()
                  ? `${formData.referralSource || "Referral"} (${formData.customReferral.trim()})`
                  : formData.referralSource || "",
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

            foodMenu: formData.foodMenu,

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

            gstEnabled:
              formData.gstEnabled ?? true,
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
          `Time: ${formatTime24to12(formData.eventTime) || formData.eventTime}`,
          `Guests: ${formData.guests}`,
          `Venue: ${formData.location}`,
          "",
          `Subtotal: ${formatCurrency(
            subtotal,
          )}`,

          `Discount: - ${formatCurrency(
            discount,
          )}`,

          isGstEnabled && gstAmount > 0
            ? `GST (${gstRate}%): ${formatCurrency(gstAmount)}`
            : `GST: Not Applicable (0%)`,

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
          Step 5
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--sage-dark)] sm:text-3xl">
          Estimate Preview &amp; Generation
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--taupe)] sm:text-base">
          Review the calculated pricing, adjust discounts or additional charges, and generate the formal estimate for this booking.
        </p>
      </div>

      {isEditing && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 shadow-2xs">
          <FileEdit size={16} className="text-amber-700 shrink-0" />
          <span>
            You are currently modifying an existing estimate proposal. Click &quot;Update Estimate&quot; below to save your changes.
          </span>
        </div>
      )}

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
                  {formatTime24to12(formData.eventTime) ||
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

          {/* Referral Source */}
          {formData.referralSource && (
            <div className="mt-4 rounded-xl border border-[#e8e1d8] bg-[#faf6f0] p-3 text-xs">
              <span className="font-bold uppercase tracking-wider text-[#9a6c37]">
                Lead / Inquiry Source:{" "}
              </span>
              <span className="font-semibold text-[#29241f]">
                {formData.customReferral && formData.customReferral.trim()
                  ? `${formData.referralSource || "Referral"} (${formData.customReferral.trim()})`
                  : formData.referralSource}
              </span>
            </div>
          )}
        </div>

        {/* ==================================== */}
        {/* Food & Catering Menu */}
        {/* ==================================== */}

        {formData.foodMenu?.included && (() => {
          const guestCount = Number(formData.guests || 100);
          const cateringItems = formData.foodMenu.items || [];
          const servingType = formData.foodMenu.servingType || "Buffet";
          const cateringSubtotal = previewFoodAmount;
          const discountRatio = subtotal > 0 && discount > 0 ? Math.min(1, discount / subtotal) : 0;
          const cateringDiscount = Math.round(cateringSubtotal * discountRatio);
          const cateringTaxable = Math.max(0, cateringSubtotal - cateringDiscount);
          const cateringGstAmount = isGstEnabled ? Math.round(cateringTaxable * (gstRate / 100)) : 0;
          const finalCateringTotal = isGstEnabled ? cateringTaxable + cateringGstAmount : cateringTaxable;

          return (
            <div className="border-b border-[var(--border)] px-5 py-6 sm:px-8 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Utensils size={17} className="text-[var(--sage)]" />
                  <div>
                    <h3 className="font-semibold text-[var(--sage-dark)]">
                      Catering & Culinary Experience
                    </h3>
                    <p className="text-xs text-[var(--taupe)]">
                      Package Scope: {guestCount.toLocaleString("en-IN")} Guests · {servingType}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#f4ecdc] px-3.5 py-1.5 text-xs font-bold text-[#8C7A55]">
                  {formatCurrency(cateringSubtotal)} package subtotal
                </div>
              </div>

              {cateringItems.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--ivory)] text-[10px] font-bold uppercase tracking-wide text-[var(--taupe)]">
                        <th className="py-2.5 px-3 w-10 text-center">No.</th>
                        <th className="py-2.5 px-3">Food Item</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-white">
                      {cateringItems.map((dish, idx) => {
                        const itemQty =
                          dish.quantity ??
                          (servingType === "PER_GUEST" ? guestCount : 1);
                        const itemUnit =
                          (dish as any).unit ||
                          (servingType === "PER_GUEST"
                            ? "Guests"
                            : servingType === "PER_PLATE"
                            ? "Plates"
                            : "Units");

                        const hasUnitPrice =
                          dish.rate !== null &&
                          dish.rate !== undefined &&
                          Number(dish.rate) > 0;
                        const hasTotalPrice =
                          dish.amount !== null &&
                          dish.amount !== undefined &&
                          Number(dish.amount) > 0;

                        return (
                          <tr key={idx} className="hover:bg-[var(--ivory)]/40 transition-colors">
                            <td className="py-2.5 px-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold text-gray-900">
                              <span className="inline-flex items-center gap-1.5">
                                <span className={`text-[8px] ${dish.dietary === "veg" ? "text-green-600" : "text-red-600"}`}>●</span>
                                <span>{dish.name}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[var(--taupe)]">{dish.category}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                              {itemQty ? Number(itemQty).toLocaleString("en-IN") : "—"}
                            </td>
                            <td className="py-2.5 px-3 text-[var(--taupe)]">{itemUnit}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                              {hasUnitPrice ? formatCurrency(Number(dish.rate)) : "—"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                              {hasTotalPrice || hasUnitPrice
                                ? formatCurrency(Number(dish.amount ?? Number(dish.rate) * Number(itemQty)))
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs italic text-gray-500">
                  Custom catering package included ({guestCount.toLocaleString("en-IN")} Guests · {servingType}). Individual menu items not itemized in this record.
                </p>
              )}

              {/* Catering Financial Summary Breakdown */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4 text-xs space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-[var(--border)] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--taupe)] block">Total Guests</span>
                    <span className="text-sm font-bold text-gray-900">{guestCount.toLocaleString("en-IN")} Guests</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--taupe)] block">Selected Items</span>
                    <span className="text-sm font-bold text-gray-900">{cateringItems.length} Dishes</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--taupe)] block">Serving Style</span>
                    <span className="text-sm font-bold text-gray-900">{servingType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--taupe)] block">Catering Subtotal</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(cateringSubtotal)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                  <div className="space-y-1">
                    {cateringDiscount > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Catering Discount (proportional):</span>
                        <span className="font-semibold text-rose-700">-{formatCurrency(cateringDiscount)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>GST Status:</span>
                      <span className={`font-semibold ${isGstEnabled ? "text-emerald-700" : "text-amber-700"}`}>
                        {isGstEnabled ? `Applied (${gstRate}%: +${formatCurrency(cateringGstAmount)})` : "Not Applicable / Excluded (₹0)"}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)] w-full sm:w-auto">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--sage)]">
                      Final Catering Package Amount
                    </div>
                    <div className="text-base font-black text-gray-900">
                      {formatCurrency(finalCateringTotal)}
                    </div>
                    <div className="text-[10px] text-gray-500 italic mt-0.5">
                      (Included in overall estimate grand total of {formatCurrency(grandTotal)})
                    </div>
                  </div>
                </div>

                {formData.foodMenu.notes && (
                  <div className="pt-2 border-t border-[var(--border)] text-xs text-gray-600">
                    <strong className="text-gray-900">Catering / Dietary Notes:</strong> {formData.foodMenu.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

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

                  const itemImg = getServiceImageUrl(item.imageUrl);

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_80px_130px_130px] items-center px-4 py-3.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {itemImg ? (
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[#f6f2eb]">
                            <img
                              src={itemImg}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        ) : null}

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>

                          <p className="mt-0.5 text-xs text-[var(--taupe)]">
                            {item.category}
                            {item.unitLabel ? ` • ${item.unitLabel}` : ""}
                          </p>
                        </div>
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
                const itemImg = getServiceImageUrl(item.imageUrl);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {itemImg ? (
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[#f6f2eb]">
                            <img
                              src={itemImg}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        ) : null}

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-[var(--taupe)]">
                            {item.category}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm font-bold text-[var(--sage-dark)] shrink-0">
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
            {/* GST Setting Toggle */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-3.5 mb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--sage-dark)]">
                      Apply GST
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                        isGstEnabled
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {isGstEnabled ? "ON (18%)" : "OFF"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--taupe)]">
                    {isGstEnabled
                      ? "ON: GST is calculated and added according to the existing tax rules."
                      : "OFF: GST is not applied to this estimate or booking."}
                  </p>
                </div>

                {(!estimate || isEditing) && (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isGstEnabled}
                    id="preview-gst-toggle"
                    onClick={() => updateField("gstEnabled", !isGstEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--sage)] ${
                      isGstEnabled ? "bg-[var(--sage-dark)]" : "bg-gray-300"
                    }`}
                  >
                    <span className="sr-only">Apply GST toggle</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isGstEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>

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

              {isGstEnabled && gstAmount > 0 ? (
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
              ) : (
                <div className="flex justify-between text-gray-600">
                  <span>
                    GST
                  </span>

                  <span className="font-medium text-gray-500 italic">
                    Not Applicable / Excluded (₹0)
                  </span>
                </div>
              )}

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
              ? "Proposal Created"
              : "Proposal Ready"}
          </h3>

          <p className="mt-1 text-sm text-[var(--taupe)]">
            {estimate
              ? `Proposal #${estimate.estimateNumber} has been saved successfully.`
              : "Review the pricing breakdown above, then generate and save the proposal."}
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

        <div className="mt-5 flex justify-center">
          <EstimateExportActions
            estimateNumber={estimate?.estimateNumber || "DRAFT"}
            eventName={formData.eventName || "Untitled Event"}
            clientName={formData.name || "Client"}
            clientPhone={formData.phone}
            clientEmail={formData.email}
            eventDate={formData.eventDate || new Date().toISOString()}
            total={grandTotal}
            currency="INR"
            documentData={constructedDocumentData}
          />
        </div>

        {/* Created status & Actions */}
        {estimate && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-[var(--sage-light)] px-4 py-3">
              <CheckCircle2
                size={17}
                className="text-[var(--sage-dark)]"
              />

              <span className="text-sm font-semibold text-[var(--sage-dark)]">
                Estimate #{estimate.estimateNumber} saved
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              {onEditEstimate && (
                <button
                  type="button"
                  onClick={onEditEstimate}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-[#d8cfc4] bg-white px-4 py-2.5 text-xs font-bold text-[#29241f] shadow-2xs hover:bg-[#faf8f5] transition active:scale-95 cursor-pointer"
                >
                  <FileEdit size={14} className="text-[#9a6c37]" />
                  <span>Edit This Estimate</span>
                </button>
              )}

              {onStartFresh && (
                <button
                  type="button"
                  onClick={onStartFresh}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100 transition active:scale-95 cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>Create Another Booking (Start Fresh)</span>
                </button>
              )}

              <Link
                href="/manager/events?tab=estimates"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-[#29241f] px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-black transition active:scale-95 cursor-pointer"
              >
                <span>View All Estimates</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ====================================== */}
      {/* Final Note */}
      {/* ====================================== */}

      <div className="rounded-xl border border-[var(--sage)]/20 bg-[var(--sage-light)]/30 px-4 py-3">
        <p className="text-xs leading-5 text-[var(--sage-dark)]">
          Verify all event details, client information, catering, and service selections before generating the final estimate.
        </p>
      </div>
    </div>
  );
}
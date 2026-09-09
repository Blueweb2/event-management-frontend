"use client";

import { useState } from "react";

import BookingProgress from "./BookingProgress";
import BookingNavigation from "./BookingNavigation";

import EventDetailsStep from "./steps/EventDetailsStep";
import ClientDetailsStep from "./steps/ClientDetailsStep";
import ServicesItemsStep from "./steps/ServicesItemsStep";
import EstimatePreviewStep from "./steps/EstimatePreviewStep";

import type { BookingFormData } from "./types";

// ==========================================
// INITIAL FORM DATA
// ==========================================

const initialFormData: BookingFormData = {
  // ========================================
  // Event Details
  // ========================================

  eventType: "",
  eventDate: "",
  eventTime: "",
  guests: "",
  location: "",
  eventName: "",
  description: "",

  // ========================================
  // Client Details
  // ========================================

  name: "",
  phone: "",
  email: "",
  message: "",

  // ========================================
  // Services & Items
  // ========================================

  services: [],

  // ========================================
  // Pricing
  // ========================================

  discountType: "percentage",
  discountValue: "0",
  additionalCharges: "0",
};

// ==========================================
// COMPONENT
// ==========================================

export default function BookingForm() {
  // ========================================
  // State
  // ========================================

  const [currentStep, setCurrentStep] =
    useState(1);

  const [formData, setFormData] =
    useState<BookingFormData>(
      initialFormData,
    );

  const [error, setError] =
    useState("");

  // ========================================
  // Update Field
  // ========================================

  const updateField = <
    K extends keyof BookingFormData,
  >(
    field: K,
    value: BookingFormData[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ========================================
  // Update Services
  // ========================================

  const updateServices = (
    services: BookingFormData["services"],
  ) => {
    setFormData((previous) => ({
      ...previous,
      services,
    }));

    if (error) {
      setError("");
    }
  };

  // ==========================================
  // VALIDATE STEP
  // ==========================================

  const validateStep = () => {
    setError("");

    // ========================================
    // STEP 1 - EVENT DETAILS
    // ========================================

    if (currentStep === 1) {
      if (!formData.eventName.trim()) {
        setError(
          "Please enter the event name.",
        );

        return false;
      }

      if (!formData.eventType.trim()) {
        setError(
          "Please select an event type.",
        );

        return false;
      }

      if (!formData.eventDate) {
        setError(
          "Please select your event date.",
        );

        return false;
      }

      if (!formData.eventTime) {
        setError(
          "Please select your event time.",
        );

        return false;
      }

      if (!formData.guests.trim()) {
        setError(
          "Please enter the number of guests.",
        );

        return false;
      }

      const guestCount = Number(
        formData.guests,
      );

      if (
        !Number.isInteger(guestCount) ||
        guestCount <= 0
      ) {
        setError(
          "Please enter a valid number of guests.",
        );

        return false;
      }

      if (!formData.location.trim()) {
        setError(
          "Please enter the event location.",
        );

        return false;
      }

      if (!formData.description.trim()) {
        setError(
          "Please describe your event.",
        );

        return false;
      }
    }

    // ========================================
    // STEP 2 - CLIENT DETAILS
    // ========================================

    if (currentStep === 2) {
      if (!formData.name.trim()) {
        setError(
          "Please enter the client name.",
        );

        return false;
      }

      if (!formData.phone.trim()) {
        setError(
          "Please enter the client phone number.",
        );

        return false;
      }

      if (!formData.email.trim()) {
        setError(
          "Please enter the client email address.",
        );

        return false;
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          formData.email.trim(),
        )
      ) {
        setError(
          "Please enter a valid email address.",
        );

        return false;
      }
    }

    // ========================================
    // STEP 3 - SERVICES & ITEMS
    // ========================================

    if (currentStep === 3) {
      if (
        formData.services.length === 0
      ) {
        setError(
          "Please add at least one service or item.",
        );

        return false;
      }

      const invalidService =
        formData.services.find(
          (service) => {
            const quantity = Number(
              service.quantity,
            );

            const unitPrice = Number(
              service.unitPrice,
            );

            return (
              !service.serviceId ||
              !service.name.trim() ||
              !Number.isFinite(
                quantity,
              ) ||
              quantity <= 0 ||
              !Number.isFinite(
                unitPrice,
              ) ||
              unitPrice < 0
            );
          },
        );

      if (invalidService) {
        setError(
          "Please check the quantity and selected services.",
        );

        return false;
      }
    }

    // ========================================
    // STEP 4 - ESTIMATE PREVIEW
    // ========================================

    if (currentStep === 4) {
      const discount = Number(
        formData.discountValue,
      );

      const additionalCharges =
        Number(
          formData.additionalCharges,
        );

      if (
        !Number.isFinite(discount) ||
        discount < 0
      ) {
        setError(
          "Please enter a valid discount.",
        );

        return false;
      }

      if (
        !Number.isFinite(
          additionalCharges,
        ) ||
        additionalCharges < 0
      ) {
        setError(
          "Please enter valid additional charges.",
        );

        return false;
      }

      if (
        formData.discountType ===
          "percentage" &&
        discount > 100
      ) {
        setError(
          "Percentage discount cannot exceed 100%.",
        );

        return false;
      }
    }

    return true;
  };

  // ==========================================
  // NEXT STEP
  // ==========================================

  const nextStep = () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep >= 4) {
      return;
    }

    setCurrentStep(
      (previous) => previous + 1,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // PREVIOUS STEP
  // ==========================================

  const previousStep = () => {
    setError("");

    if (currentStep <= 1) {
      return;
    }

    setCurrentStep(
      (previous) => previous - 1,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // SUBMIT
  //
  // IMPORTANT:
  //
  // EstimatePreviewStep handles the actual
  // estimate creation.
  //
  // We intentionally do NOT call the API here,
  // otherwise clicking "Create Estimate" in
  // the preview and the navigation button could
  // create duplicate estimates.
  // ==========================================

  const submitBooking = () => {
    if (!validateStep()) {
      return;
    }

    // Step 4 handles estimate creation.
    if (currentStep === 4) {
      return;
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      {/* ====================================== */}
      {/* Progress */}
      {/* ====================================== */}

      <BookingProgress
        currentStep={currentStep}
      />

      {/* ====================================== */}
      {/* Main Content */}
      {/* ====================================== */}

      <section className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">

          {/* ====================================
              STEP 1 - EVENT DETAILS
          ==================================== */}

          {currentStep === 1 && (
            <EventDetailsStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* ====================================
              STEP 2 - CLIENT DETAILS
          ==================================== */}

          {currentStep === 2 && (
            <ClientDetailsStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* ====================================
              STEP 3 - SERVICES & ITEMS
          ==================================== */}

          {currentStep === 3 && (
            <ServicesItemsStep
              formData={formData}
              updateServices={
                updateServices
              }
            />
          )}

          {/* ====================================
              STEP 4 - ESTIMATE PREVIEW
          ==================================== */}

          {currentStep === 4 && (
            <EstimatePreviewStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* ====================================
              ERROR
          ==================================== */}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* ====================================
              NAVIGATION
          ==================================== */}

          <BookingNavigation
            currentStep={currentStep}
            totalSteps={4}
            onBack={previousStep}
            onNext={nextStep}
            onSubmit={submitBooking}
            loading={false}
          />
        </div>
      </section>
    </>
  );
}
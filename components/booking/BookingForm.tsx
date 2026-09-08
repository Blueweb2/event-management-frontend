"use client";

import { useState } from "react";

import BookingProgress from "./BookingProgress";
import BookingNavigation from "./BookingNavigation";

import EventDetailsStep from "./steps/EventDetailsStep";
import ServicesItemsStep from "./steps/ServicesItemsStep";
import PricingStep from "./steps/PricingStep";
import EstimatePreviewStep from "./steps/EstimatePreviewStep";

import type { BookingFormData } from "./types";

const initialFormData: BookingFormData = {
  eventType: "",
  eventDate: "",
  eventTime: "",
  guests: "",
  location: "",
  eventName: "",
  description: "",

  services: [],

  discountType: "percentage",
  discountValue: "0",
  additionalCharges: "0",

  name: "",
  phone: "",
  email: "",
  message: "",
};

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] =
    useState<BookingFormData>(initialFormData);

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const updateField = (
    field: keyof BookingFormData,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

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

  const validateStep = () => {
    setError("");

    // STEP 1 - EVENT DETAILS
    if (currentStep === 1) {
      if (!formData.eventName.trim()) {
        setError("Please enter the event name.");
        return false;
      }

      if (!formData.eventType.trim()) {
        setError("Please select an event type.");
        return false;
      }

      if (!formData.eventDate) {
        setError("Please select your event date.");
        return false;
      }

      if (!formData.eventTime) {
        setError("Please select your event time.");
        return false;
      }

      if (!formData.guests.trim()) {
        setError("Please enter the number of guests.");
        return false;
      }

      const guestCount = Number(formData.guests);

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
        setError("Please enter the event location.");
        return false;
      }
    }

    // STEP 2 - SERVICES & ITEMS
    if (currentStep === 2) {
      if (formData.services.length === 0) {
        setError(
          "Please add at least one service or item.",
        );
        return false;
      }
    }

    // STEP 3 - PRICING
    if (currentStep === 3) {
      const discount = Number(
        formData.discountValue,
      );

      const additionalCharges = Number(
        formData.additionalCharges,
      );

      if (Number.isNaN(discount) || discount < 0) {
        setError(
          "Please enter a valid discount.",
        );
        return false;
      }

      if (
        Number.isNaN(additionalCharges) ||
        additionalCharges < 0
      ) {
        setError(
          "Please enter valid additional charges.",
        );
        return false;
      }
    }

    // STEP 4 - PREVIEW / SUBMIT
    if (currentStep === 4) {
      if (!formData.name.trim()) {
        setError("Please enter the client name.");
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
    }

    return true;
  };

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

  const submitBooking = async () => {
    if (!validateStep()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Backend API will be connected here.
      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      );

      console.log(
        "Estimate submitted:",
        formData,
      );

      setSubmitted(true);
    } catch (submitError) {
      console.error(
        "Estimate submission failed:",
        submitError,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              ✓
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
              Estimate Created
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600 sm:text-base">
              The estimate has been successfully
              created and is ready to share with
              the client.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <BookingProgress
        currentStep={currentStep}
      />

      <section className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">

          {/* STEP 1 */}
          {currentStep === 1 && (
            <EventDetailsStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <ServicesItemsStep
              formData={formData}
              updateServices={updateServices}
            />
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <PricingStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <EstimatePreviewStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* ERROR */}
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

          {/* NAVIGATION */}
          <BookingNavigation
            currentStep={currentStep}
            totalSteps={4}
            onBack={previousStep}
            onNext={nextStep}
            onSubmit={submitBooking}
            loading={isSubmitting}
          />

        </div>
      </section>
    </>
  );
}